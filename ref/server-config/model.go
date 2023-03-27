package config

import (
	"fmt"
	"io/ioutil"
	"log"
	"regexp"
	"strings"

	"gopkg.in/yaml.v3"
)

// Config models the configuration
type Config struct {
	// Name used for doc generation.
	Name string
	// Top-level config description for doc generation.
	Description string
	// Sections are the top-level sections for the config.
	Sections []*Section
	// Types is an index of custom-defined types, e.g. `tls`, `listen`,
	// `user`, etc.
	Types map[string]*Property
}

// Section provides logical naming and organization for properties.
type Section struct {
	// Name of the section, e.g. "Connectivity"
	Name string
	// URL is an optional URL to a page with more information this section.
	URL string
	// Description of the section.
	Description string
	// Properties contains the ordered set of properties within this section.
	Properties []*Property
}

// Property models a configuration property.
type Property struct {
	// Name of the property, e.g. `host` or `jetstream`.
	Name string
	// Types are the set of types this property's value could be.
	Types []string
	// URL is an optional URL to a page with more information about
	// this property.
	URL string
	// Description of the property.
	Description string
	// Deprecation is an optional note on the property being deprecated
	// and whether there is an alternate property to use.
	Deprecation string
	// Default value for this property. In practice, this only applies to
	// primitive values.
	Default any
	// Disabled is applied when generating a config file to explicitly
	// comment out a property. For example, when the `cluster` block is
	// present, it implies that it is enabled. If this property is true,
	// the generated config file will comment this block out.
	Disabled bool
	// Examples are a set of example values.
	Examples []*Example
	// Aliases are the set of aliases for this property, e.g. `subscribe`
	// and `sub`.
	Aliases []string
	// Reloadable indicates a change to this property in a server config can
	// be hot-reloaded rather than a hard restart of the server.
	Reloadable bool
	// Sections nested under this property. This only applies to object-based
	// properties, e.g. `cluster {...}`.
	Sections []*Section
	// Version indicates the version of the server this property
	// became available.
	Version string
}

type Example struct {
	Label string
	Value string
}

// Parse takes the config and type definition paths and derives the config.
func Parse(path string, typePaths []string) (*Config, error) {
	yc, err := loadConfig(path)
	if err != nil {
		return nil, err
	}

	// Index of types for reference.
	ytypes := make(map[string]*yamlProperty)
	for _, path := range typePaths {
		f, err := loadTypes(path)
		if err != nil {
			return nil, err
		}
		for k, t := range f.Types {
			// Check for duplicates.
			if _, ok := ytypes[k]; ok {
				return nil, fmt.Errorf("duplicate type found: %q", k)
			}
			t.Name = k
			ytypes[k] = t
		}
	}

	types := make(map[string]*Property)
	for k, yp := range ytypes {
		p, err := parseProperty(ytypes, yp)
		if err != nil {
			return nil, err
		}
		types[k] = p
	}

	// Top-level config sections.
	var sections []*Section

	for _, ys := range yc.Sections {
		s, err := parseSection(ytypes, ys)
		if err != nil {
			return nil, err
		}
		sections = append(sections, s)
	}

	c := Config{
		Sections: sections,
		Types:    types,
	}

	return &c, nil
}

type yamlFile struct {
	Types map[string]*yamlProperty
}

type yamlConfig struct {
	Sections []*yamlSection
}

type yamlProperty struct {
	Name        string
	Type        string
	Types       []string
	URL         string
	Default     any
	Disabled    bool
	Description string
	Deprecation string
	Examples    []*Example
	Aliases     []string
	Reloadable  *bool
	Sections    []*yamlSection
	Properties  yaml.Node
	Version     string
}

// Merge takes the schema identified by its type and merges in
// the unset fields.
func (p *yamlProperty) Merge(b *yamlProperty) {
	if b.Type != "" {
		p.Types = []string{b.Type}
	} else {
		p.Types = b.Types
	}
	if p.Version != "" {
		p.Version = b.Version
	}
	if p.Disabled {
		p.Disabled = b.Disabled
	}
	if p.Description == "" {
		p.Description = b.Description
	}
	if p.Default == nil {
		p.Default = b.Default
	}
	if len(p.Aliases) == 0 {
		p.Aliases = b.Aliases
	}
	if p.Reloadable == nil {
		p.Reloadable = b.Reloadable
	}
	if p.Deprecation == "" {
		p.Deprecation = b.Deprecation
	}
	if len(p.Examples) == 0 {
		p.Examples = b.Examples
	}
	if p.Properties.IsZero() {
		p.Properties = b.Properties
	}
	if len(p.Sections) == 0 {
		for _, s := range b.Sections {
			p.Sections = append(p.Sections, &yamlSection{
				Name:        s.Name,
				Description: s.Description,
				Properties:  s.Properties,
			})
		}
	}
}

type yamlSection struct {
	Name        string
	Description string
	URL         string
	Properties  yaml.Node
}

func loadConfig(path string) (*yamlConfig, error) {
	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}

	var f yamlConfig
	err = yaml.Unmarshal(b, &f)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}

	return &f, nil
}

func loadTypes(path string) (*yamlFile, error) {
	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}

	var f yamlFile
	err = yaml.Unmarshal(b, &f)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}

	return &f, nil
}

var (
	arrayTypeRe = regexp.MustCompile(`^array\((.+)\)$`)
	mapTypeRe   = regexp.MustCompile(`^map\((.+)\)$`)
)

func parseProperty(ytypes map[string]*yamlProperty, yp *yamlProperty) (*Property, error) {
	if yp.Type != "" {
		yp.Types = []string{yp.Type}
	}

	for _, t := range yp.Types {
		switch t {
		// Primitives
		case "object", "float", "string", "integer", "boolean", "duration":
		default:
			// Generic container types.
			if arrayTypeRe.MatchString(t) || mapTypeRe.MatchString(t) {
				break
			}

			b, ok := ytypes[t]
			if !ok {
				return nil, fmt.Errorf("unknown type %q for property %q", t, yp.Name)
			}

			if len(yp.Types) == 1 {
				yp.Merge(b)
			} else {
				log.Printf("WARN: deref with multiple types for %q", yp.Name)
			}
		}
	}

	if !yp.Properties.IsZero() {
		yp.Sections = []*yamlSection{{
			Properties: yp.Properties,
		}}
	}

	var sections []*Section
	if len(yp.Sections) > 0 {
		sections = make([]*Section, len(yp.Sections))
		for i, ys := range yp.Sections {
			s, err := parseSection(ytypes, ys)
			if err != nil {
				return nil, err
			}
			sections[i] = s
		}
	}

	reloadable := true
	if yp.Reloadable != nil {
		reloadable = *yp.Reloadable
	}

	p := Property{
		Name:        strings.TrimSpace(yp.Name),
		Description: strings.TrimSpace(yp.Description),
		Types:       yp.Types,
		Disabled:    yp.Disabled,
		Default:     yp.Default,
		Deprecation: strings.TrimSpace(yp.Deprecation),
		Examples:    yp.Examples,
		Aliases:     yp.Aliases,
		Reloadable:  reloadable,
		Sections:    sections,
	}

	return &p, nil
}

func parseSection(ytypes map[string]*yamlProperty, ys *yamlSection) (*Section, error) {
	if len(ys.Properties.Content) == 0 {
		return &Section{
			Name:        ys.Name,
			Description: ys.Description,
		}, nil
	}

	if ys.Properties.Kind != yaml.MappingNode {
		return nil, fmt.Errorf("expected YAML mapping node: line %d", ys.Properties.Line)
	}

	if len(ys.Properties.Content)%2 != 0 {
		return nil, fmt.Errorf("expected key-value pairs")
	}

	var props []*Property
	for i := 0; i < len(ys.Properties.Content)/2; i++ {
		kc := ys.Properties.Content[i*2]
		vc := ys.Properties.Content[i*2+1]

		var yp yamlProperty
		if err := vc.Decode(&yp); err != nil {
			return nil, fmt.Errorf("failed property decode at line %d: %w", vc.Line, err)
		}

		yp.Name = kc.Value

		p, err := parseProperty(ytypes, &yp)
		if err != nil {
			return nil, err
		}

		props = append(props, p)
	}

	s := Section{
		Name:        ys.Name,
		Description: ys.Description,
		Properties:  props,
	}

	return &s, nil
}
