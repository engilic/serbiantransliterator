// commitlint.config.js

// commitlint.config.js

// commitlint.config.js

module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [
            2,
            "always",
            [
                "feat", // New feature
                "fix", // Bug fix
                "docs", // Documentation only
                "style", // Formatting, missing semi colons...
                "refactor", // Code change that neither fixes a bug nor adds a feature
                "perf", // Code change that improves performance
                "test", // Adding missing tests
                "chore", // Maintain
                "build", // Build system
                "ci", // CI configuration
                "revert", // Revert a commit
            ],
        ],
        "subject-case": [0], // Allow sentence case in subject
    },
};
