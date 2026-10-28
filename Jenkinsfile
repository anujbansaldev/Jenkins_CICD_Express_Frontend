pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Node.js Environment') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Validate Package Manifest') {
            steps {
                sh 'npm ci --dry-run --ignore-scripts'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Validate JavaScript') {
            steps {
                sh 'node --check server.js'
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    if node -e 'const packageJson = require("./package.json"); process.exit(packageJson.scripts && packageJson.scripts.test ? 0 : 1)'; then
                        npm test
                    else
                        echo 'No test script is defined in package.json; skipping automated tests.'
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo 'Express frontend validation passed.'
        }
        failure {
            echo 'Express frontend pipeline failed. Review the console log.'
        }
    }
}
