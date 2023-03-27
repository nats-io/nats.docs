package config

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

func generateTemplate(w io.Writer, p *Property, base string, hier []string) error {
	o := func(str string, args ...any) {
		fmt.Fprintf(w, str, args...)
	}

	o("# %s\n\n", p.Name)

	nbase := base
	for i, tok := range hier {
		var p string
		if i == 0 {
			p = nbase
			tok = strings.ToLower(tok)
		} else {
			p = filepath.Join(nbase, tok)
		}
		nbase = filepath.Join(nbase, tok)
		l := fmt.Sprintf("[%s](%s/index.md)", tok, p)
		o("/ %s ", l)
	}
	o("\n\n")

	if p.Deprecation != "" {
		o("_**Deprecation notice.** %s_\n\n", p.Deprecation)
	}

	if p.Description != "" {
		o("%s\n\n", p.Description)
	}

	if p.Default != nil {
		o("*Default value*: `%v`\n", p.Default)
	}
	if p.Disabled {
		o("*Disabled by default*\n")
	}
	if len(p.Aliases) > 0 {
		o("*Aliases*\n")
		for _, a := range p.Aliases {
			o("- `%s`\n", a)
		}
		o("\n")
	}

	if len(p.Sections) > 0 {
		o("## Properties\n\n")

		for _, s := range p.Sections {
			if s.Name != "" {
				o("**%s**\n\n", s.Name)
			}

			for _, x := range s.Properties {
				var path string
				if len(hier) <= 1 {
					path = base
				} else {
					path = filepath.Join(base, filepath.Join(hier[1:]...), p.Name)
				}
				o("### [`%s`](%s/%s/index.md)\n\n", x.Name, path, x.Name)
				o("%s\n\n", x.Description)
				if x.Default != nil {
					o("Default value: `%v`\n\n", x.Default)
				}
				if x.Disabled {
					o("*Disabled by default*`\n\n")
				}
			}
		}
	}

	if len(p.Examples) > 0 {
		o("## Examples\n\n")

		for _, e := range p.Examples {
			if e.Label != "" {
				o("%s\n", e.Label)
			}
			o("```\n")
			o("%v\n", e.Value)
			o("```\n")
		}
		o("\n")
	}

	return nil
}

// GenerateMarkdown generates a directory of markdown files, including
// the top-level and one for each nested property.
func GenerateMarkdown(config *Config, dir string, base string) error {
	buf := bytes.NewBuffer(nil)

	prop := Property{
		Name:     "Config",
		Sections: config.Sections,
	}

	if base == "/" {
		base = ""
	} else if strings.HasSuffix(base, "/") {
		base = base[:len(base)-1]
	}

	return generatePropMarkdown(&prop, buf, dir, base, nil)
}

func generatePropMarkdown(prop *Property, buf *bytes.Buffer, dir, base string, hier []string) error {
	buf.Reset()
	if err := generateTemplate(buf, prop, base, hier); err != nil {
		return fmt.Errorf("execute template: %w", err)
	}

	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("make dir: %w", err)
	}

	path := filepath.Join(dir, "index.md")
	if err := os.WriteFile(path, buf.Bytes(), 0644); err != nil {
		return fmt.Errorf("write file: %w", err)
	}

	var nhier []string
	nhier = append(nhier, hier...)
	nhier = append(nhier, prop.Name)
	fmt.Println(nhier)

	for _, s := range prop.Sections {
		for _, p := range s.Properties {
			ndir := filepath.Join(dir, p.Name)
			if err := generatePropMarkdown(p, buf, ndir, base, nhier); err != nil {
				return err
			}
		}
	}

	return nil
}
