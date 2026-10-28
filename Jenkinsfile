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
