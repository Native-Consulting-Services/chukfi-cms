package main

import (
	"os"
	"os/exec"
)

const version = "v0.1.1"

func returnCommandNames() []string {
	// Load all commands from the cmd folder
	commandFolder, err := os.ReadDir("./cmd")
	if err != nil {
		panic(err)
	}

	// return names of all commands
	var commandNames []string
	for _, command := range commandFolder {
		if command.IsDir() {
			commandNames = append(commandNames, command.Name())
		}
	}

	return commandNames
}

func helpMessage() {

	println("Chukfi CMS Backend " + version)
	println("Commands:")
	println("  help        Show this help message")
	// list all commands in cmd folder
	names := returnCommandNames()
	for _, name := range names {
		println("  " + name)
	}
}

func main() {
	// read the args of the command line
	args := os.Args[1:]

	if len(args) == 0 {
		// help message
		helpMessage()
		return
	}

	names := returnCommandNames()

	switch args[0] {
	case "help":
		helpMessage()
		break
	default:
		// check if the command exists
		found := false
		for _, name := range names {
			if args[0] == name {
				found = true
				break
			}
		}

		if found {
			// os.Exec
			// get my directory
			myDir, err := os.Getwd()
			if err != nil {
				println("Failed to get working directory:", err.Error())
				return
			}
			cmdPath := myDir + "/cmd/" + args[0] + "/main.go"
			cmdArgs := append([]string{"run", cmdPath}, args[1:]...)
			cmd := exec.Command("go", cmdArgs...)
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr
			cmd.Stdin = os.Stdin
			err = cmd.Run()
		} else {
			println("Command not found:", args[0])
		}
	}

}
