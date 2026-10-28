pipeline {
    agent any

    environment {
        DEPLOY_DIR = '/opt/jenkins-cicd/Frontend'
        NODE_BIN = '/usr/bin/node'
        NPM_BIN = '/usr/bin/npm'
    }

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
                sh 'test -x "$NODE_BIN"'
                sh 'test -x "$NPM_BIN"'
                sh '"$NODE_BIN" --version'
                sh '"$NPM_BIN" --version'
                sh 'command -v rsync'
                sh 'command -v curl'
            }
        }

        stage('Validate Package Manifest') {
            steps {
                sh '"$NPM_BIN" ci --dry-run --ignore-scripts'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '"$NPM_BIN" ci'
            }
        }

        stage('Validate JavaScript') {
            steps {
                sh '"$NODE_BIN" --check server.js'
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    if "$NODE_BIN" -e 'const packageJson = require("./package.json"); process.exit(packageJson.scripts && packageJson.scripts.test ? 0 : 1)'; then
                        "$NPM_BIN" test
                    else
                        echo 'No test script is defined in package.json; skipping automated tests.'
                    fi
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    test -d "$DEPLOY_DIR"

                    rsync -a --no-owner --no-group \
                        --exclude='.git/' \
                        --exclude='node_modules/' \
                        --exclude='.env' \
                        --exclude='.env.*' \
                        --exclude='__pycache__/' \
                        --exclude='*.py[cod]' \
                        --exclude='.pytest_cache/' \
                        --exclude='coverage/' \
                        --exclude='dist/' \
                        --exclude='build/' \
                        --exclude='*.log' \
                        ./ "$DEPLOY_DIR/"
                '''
            }
        }

        stage('Install Production Dependencies') {
            steps {
                sh '''
                    cd "$DEPLOY_DIR"
                    "$NPM_BIN" ci --omit=dev --ignore-scripts
                '''
            }
        }

        stage('Restart Service') {
            steps {
                sh 'sudo -n /usr/bin/systemctl restart express-frontend'
            }
        }

        stage('Verify Health') {
            steps {
                sh '''
                    HEALTH_FILE="$(mktemp)"
                    trap 'rm -f "$HEALTH_FILE"' EXIT

                    HTTP_STATUS="$(curl --silent --show-error --max-time 10 \
                        --output "$HEALTH_FILE" --write-out '%{http_code}' \
                        http://127.0.0.1:3000/api/health)"

                    if [ "$HTTP_STATUS" != "200" ]; then
                        echo "Health check failed with HTTP status $HTTP_STATUS"
                        exit 1
                    fi

                    if ! "$NODE_BIN" -e '
                        const fs = require("fs");
                        const response = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
                        const backendHealthy = response.backend && response.backend.status === "success";
                        if (response.status !== "success" || response.frontend !== "ok" || !backendHealthy) {
                            process.exit(1);
                        }
                    ' "$HEALTH_FILE"; then
                        echo 'Health response does not confirm that the Express frontend and Flask backend are healthy.'
                        exit 1
                    fi

                    echo 'Express frontend health check passed with HTTP status 200 and a healthy Flask backend.'
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
