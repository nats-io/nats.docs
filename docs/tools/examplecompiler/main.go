package main

import (
	"encoding/json"
	"bufio"
	"bytes"
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"unicode"
)

type exampleRepo struct {
	LanguageName string
	FormalName   string
	RepoURL      string
	Extensions   []string
	SyntaxClass  string
}

type languageExample struct {
	Language    string
	FormalName  string
	Content     string
	RepoURL     string
	SyntaxClass string
	First       bool
}

type languageList []languageExample

func (s languageList) Len() int {
	return len(s)
}
func (s languageList) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}
func (s languageList) Less(i, j int) bool {
	return s[i].Language < s[j].Language
}

type example struct {
	Name      string
	Languages languageList
}

func searchRepo(repoDirectory string, repo exampleRepo, examples map[string]*example) error {

	extensions := make(map[string]string)
	for _, ext := range repo.Extensions {
		extensions[ext] = ext
	}

	fmt.Printf("Searching for examples in: %q\n", repoDirectory)

	err := filepath.Walk(repoDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Printf("prevent panic by handling failure accessing a path %q: %v\n", repoDirectory, err)
			return err
		}

		ext := filepath.Ext(path)

		if _, ok := extensions[ext]; ok {
			fmt.Printf("\tReading: %q\n", info.Name())
			file, err := os.Open(path)
			if err != nil {
				log.Fatal(err)
			}
			defer file.Close()

			var buffer bytes.Buffer
			exampleName := ""
			beginExample, err := regexp.Compile(`\[begin ([^\s\[\]]+)\]`)

			if err != nil {
				log.Fatal(err)
			}

			endExample, err := regexp.Compile(`\[end ([^\s\[\]]+)\]`)

			if err != nil {
				log.Fatal(err)
			}

			scanner := bufio.NewScanner(file)
			lineNumber := 1
			beginLineNumber := lineNumber
			relativePath, err := filepath.Rel(repoDirectory, path)
			var indentRegex *regexp.Regexp

			if err != nil {
				log.Fatal(err)
			}

			for scanner.Scan() {
				currentLine := scanner.Text()

				if exampleName == "" {
					matches := beginExample.FindStringSubmatch(currentLine)

					if len(matches) == 2 {
						exampleName = matches[1]
						beginLineNumber = lineNumber
						endExample, err = regexp.Compile(`\[end ` + exampleName + `\]`)
						if err != nil {
							log.Fatal(err)
						}
					}
				} else if endExample.FindStringSubmatch(currentLine) != nil {
					fmt.Printf("\t\tFound %q example\n", exampleName)

					if _, ok := examples[exampleName]; !ok {
						examples[exampleName] = &example{
							Name:      exampleName,
							Languages: []languageExample{},
						}
					}

					simpleRepoURL := strings.Replace(repo.RepoURL, ".git", "", -1)
					gitHubURL := fmt.Sprintf("%s/blob/master/%s#L%d-%d", simpleRepoURL, relativePath, beginLineNumber, lineNumber)
					example := examples[exampleName]
					langExample := languageExample{
						Language:    repo.LanguageName,
						FormalName:  repo.FormalName,
						SyntaxClass: repo.SyntaxClass,
						Content:     buffer.String(),
						RepoURL:     gitHubURL,
					}

					example.Languages = append(example.Languages, langExample)

					// fmt.Printf("\t\tRepo url: %s\n", langExample.RepoURL)

					exampleName = "" // Look for another example in this file
					buffer.Reset()
				} else {
					// Calculate indent from first line
					// Blindly chop following lines (this could be smarter)
					if buffer.Len() == 0 {
						before := len(currentLine)
						currentLine = strings.TrimLeftFunc(currentLine, func(r rune) bool {
							return unicode.IsSpace(r)
						})
						after := len(currentLine)
						indent := before - after

						if indent > 0 {
							indentRegexString := fmt.Sprintf("^\\s{0,%d}", indent)
							indentRegex, err = regexp.Compile(indentRegexString)
						}
					} else {
						if indentRegex != nil {
							currentLine = string(indentRegex.ReplaceAllString(currentLine, ""))
						}
					}
					buffer.WriteString(currentLine)
					buffer.WriteString("\n")
				}

				lineNumber++
			}

			if err := scanner.Err(); err != nil {
				log.Fatal(err)
			}
		}

		return nil
	})

	if err != nil {
		fmt.Printf("error walking the path %q: %v\n", repoDirectory, err)
	}

	return err
}

func formatExamples(examples map[string]*example, exampleTemplate *template.Template, outputFolder string) {
	fmt.Printf("Formatting examples\n")

	for _, example := range examples {
		if len(example.Languages) == 0 {
			fmt.Printf("\tSkipping empty example %q\n", example.Name)
			return
		}
	
		sort.Sort(languageList(example.Languages))
		example.Languages[0].First = true
	
		var buffer bytes.Buffer
		err := exampleTemplate.Execute(&buffer, example)
		if err != nil {
			log.Fatal(err)
		}
	
		htmlPath := filepath.Join(outputFolder, fmt.Sprintf("%s.html", example.Name))
		err = ioutil.WriteFile(htmlPath, buffer.Bytes(), 0666)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("\tFormatted %q to %q\n", example.Name, htmlPath)
	}
}

func usage() {
	log.Fatalf("Usage: examplecompiler -o <outputfolder> -t <template> -r <repo_list>\n")
}

func main() {
	var outputFolder string
	var templateFile string
	var repoList string

	flag.StringVar(&outputFolder, "o", "", "Output folder")
	flag.StringVar(&repoList, "r", "", "Repo list as a JSON file")
	flag.StringVar(&templateFile, "t", "", "Template file")

	log.SetFlags(0)
	flag.Usage = usage
	flag.Parse()

	if outputFolder == "" || templateFile == "" || repoList == "" {
		usage()
	}

	templateData, err := ioutil.ReadFile(templateFile)
	if err != nil {
		log.Fatal(err)
	}
	exampleTemplateString := string(templateData)

	exampleTemplate, err := template.New("example").Parse(exampleTemplateString)
	if err != nil {
		log.Fatal(err)
	}

	// Create a tmp dir to do our work in
	dir, err := ioutil.TempDir("", "site_examples")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Working directory created: %q\n", dir)

	allRepoDir := filepath.Join(dir, "repos")
	_ = os.Mkdir(allRepoDir, 0777)

	fmt.Printf("Insuring output folder: %s\n", outputFolder)
	_ = os.Mkdir(outputFolder, 0777)

	repoJSON, err := ioutil.ReadFile(repoList)
	if err != nil {
		log.Fatal(err)
	}

	repos := []exampleRepo{}
	err = json.Unmarshal(repoJSON, &repos)
	if err != nil {
		log.Fatal(err)
	}

	examples := make(map[string]*example)

	for _, repo := range repos {
		_, repoName := filepath.Split(repo.RepoURL)
		repoName = repoName[0 : len(repoName)-len(".git")]

		repoPath := filepath.Join(allRepoDir, repoName)

		fmt.Printf("Downloading repo: %q\n", repo.RepoURL)
		cmd := exec.Command("git", "clone", repo.RepoURL, repoName)
		cmd.Dir = allRepoDir
		cmd.Run()

		searchRepo(repoPath, repo, examples)
	}
	
	formatExamples(examples, exampleTemplate, outputFolder)
}
