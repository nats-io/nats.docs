package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"github.com/nats-io/config"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run() error {
	var (
		configYaml  string
		typesDir    string
		refDir      string
		refBasePath string
	)

	flag.StringVar(&configYaml, "config", "config.yaml", "The root config YAML file.")
	flag.StringVar(&typesDir, "types", "types", "The path to the types directory.")
	flag.StringVar(&refDir, "ref", "ref", "The output directory for the reference docs.")
	flag.StringVar(&refBasePath, "ref.base", "", "Base URL path for the ref document paths.")

	flag.Parse()

	var paths []string
	entries, err := os.ReadDir(typesDir)
	if err != nil {
		return fmt.Errorf("read dir: %w", err)
	}
	for _, e := range entries {
		paths = append(paths, filepath.Join(typesDir, e.Name()))
	}

	c, err := config.Parse(configYaml, paths)
	if err != nil {
		return err
	}

	//config.GenerateConfig(os.Stdout, c)
	return config.GenerateMarkdown(c, refDir, refBasePath)
}
