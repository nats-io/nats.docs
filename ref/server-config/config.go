package config

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
	"strings"
)

const defaultLineLength = 70
const defaulTabSize = 4

// splitText takes a string of text and splits it up in to lines
// having a max line length size.
func splitText(text string, length int) []string {
	b := bytes.NewBufferString(text)
	s := bufio.NewScanner(b)
	s.Split(bufio.ScanWords)

	var lines []string

	var line string
	for s.Scan() {
		w := s.Text()

		if len(line)+len(w) > length {
			line = strings.TrimSpace(line)
			lines = append(lines, line)
			line = w
		} else {
			line = fmt.Sprintf("%s %s", line, w)
		}
	}

	line = strings.TrimSpace(line)
	lines = append(lines, line)

	return lines
}

// prefixLines prepends a prefix to a slice of lines.
func prefixLines(prefix string, lines []string) []string {
	for i, l := range lines {
		lines[i] = fmt.Sprintf("%s%s", prefix, l)
	}
	return lines
}

func GenerateConfig(w io.Writer, sections []*Section) {
	generateConfig(w, 0, 0, sections, false)
}

func generateConfigValue(w io.Writer, depth int, cdepth int, p *Property, disabled bool) {
	tab := strings.Repeat(" ", depth*defaulTabSize)
	//ctab := strings.Repeat(" ", cdepth*defaulTabSize)

	/*
		first := true
		for _, k := range p.Types {
			var prefixChar byte
			var suffixChar byte

			if strings.HasPrefix(k, "[]") {
				prefixChar = '['
				suffixChar = ']'
				k = k[2:]
			} else if strings.HasPrefix(k, "{}") {
				prefixChar = '{'
				suffixChar = '}'
				k = k[2:]
			}

			// Ignore unknown types which should only be primitives at this stage.
			t, ok := types[k]
			if !ok {
				continue
			}

			if first {
				fmt.Fprintf(w, "%s# Forms:\n", tab)
				first = false
			}

			if len(t.Sections) > 0 {
				fmt.Fprintf(w, "%s# %s%s %c{\n", tab, ctab, t.Name, prefixChar)
				generateConfigValue(w, depth, cdepth+1, types, t)
				fmt.Fprintf(w, "%s# %s}%c\n", tab, ctab, suffixChar)
			} else {
				generateConfigValue(w, depth, cdepth+1, types, t)
			}
		}
	*/

	if p.Default == nil {
		t := strings.Join(p.Types, " | ")
		fmt.Fprintf(w, "%s# %s: <%s>\n", tab, p.Name, t)
	} else {
		fmt.Fprintf(w, "%s# %s: %v\n", tab, p.Name, p.Default)
	}
}

func generateConfig(w io.Writer, depth int, cdepth int, sections []*Section, disabled bool) {
	// Comment indent
	tab := strings.Repeat(" ", depth*defaulTabSize)
	// Code indent
	//ctab := strings.Repeat(" ", cdepth*defaulTabSize)

	for j, s := range sections {
		if j > 0 {
			fmt.Fprintf(w, "\n")
		}

		if s.Name != "" {
			line := strings.Repeat("#", len(s.Name)+4)
			fmt.Fprintf(w, "%s%s\n", tab, line)
			fmt.Fprintf(w, "%s# %s #\n", tab, s.Name)
			fmt.Fprintf(w, "%s%s\n\n", tab, line)
		}

		lastIndex := len(s.Properties) - 1
		for i, p := range s.Properties {
			if p.Description != "" {
				lines := splitText(p.Description, defaultLineLength)
				for _, line := range lines {
					fmt.Fprintf(w, "%s# %s\n", tab, line)
				}
			}

			if len(p.Examples) > 0 {
				fmt.Fprintf(w, "%s# Examples:\n", tab)
				for _, e := range p.Examples {
					fmt.Fprintf(w, "%s#   - %v\n", tab, e)
				}
			}

			if len(p.Deprecation) > 0 {
				fmt.Fprintf(w, "%s# Deprecation Note:\n", tab)
				lines := splitText(p.Deprecation, defaultLineLength)
				for _, line := range lines {
					fmt.Fprintf(w, "%s# %s\n", tab, line)
				}
			}

			if len(p.Sections) > 0 {
				var prefixByte byte
				if disabled || p.Disabled {
					prefixByte = '#'
				}
				fmt.Fprintf(w, "%s%c%s {\n", tab, prefixByte, p.Name)
				generateConfig(w, depth+1, cdepth, p.Sections, p.Disabled)
				fmt.Fprintf(w, "%s%c}\n", tab, prefixByte)
				if i != lastIndex {
					fmt.Fprintf(w, "\n")
				}
				continue
			}

			generateConfigValue(w, depth, cdepth, p, disabled)
			if i != lastIndex {
				fmt.Fprintf(w, "\n")
			}
		}
	}
}
