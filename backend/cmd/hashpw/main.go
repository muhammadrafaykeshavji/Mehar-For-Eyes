// Command hashpw prints an argon2id hash for ADMIN_PASSWORD_HASH.
//
// Usage: go run ./cmd/hashpw   (prompts on stdin; input is echoed)
package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"mehar/backend/internal/auth"
)

func main() {
	fmt.Fprint(os.Stderr, "Password: ")
	line, err := bufio.NewReader(os.Stdin).ReadString('\n')
	pw := strings.TrimRight(line, "\r\n")
	if pw == "" || (err != nil && line == "") {
		fmt.Fprintln(os.Stderr, "empty password")
		os.Exit(1)
	}
	if len(pw) < 12 {
		fmt.Fprintln(os.Stderr, "use at least 12 characters")
		os.Exit(1)
	}
	hash, err := auth.HashPassword(pw)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Println(hash)
}

