#!/bin/bash

aws lambda update-function-code --function-name scholarjet-thumbnailer-dev --region us-east-1 --zip-file fileb://./dist/function.zip
