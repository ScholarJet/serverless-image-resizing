# Serverless Image Resizing

## Description

Resizes images on the fly using Amazon S3, AWS Lambda, and Amazon API Gateway.
Using a conventional URL structure and S3 static website hosting with
redirection rules, requests for resized images are redirected to a Lambda
function via API Gateway which will resize the image, upload it to S3, and
redirect the requestor to the resized image. The next request for the resized
image will be served from S3 directly.

## Usage

1. Build the Lambda function

   The Lambda function uses [sharp][sharp] for image resizing which requires
   native extensions. In order to run on Lambda, it must be packaged on Amazon
   Linux. You can accomplish this in one of two ways:

   - Upload the contents of the `lambda` subdirectory to an [Amazon EC2 instance
     running Amazon Linux][amazon-linux] and run `npm install`, or

   - Use the Amazon Linux Docker container image to build the package using your
     local system. This repo includes Makefile that will download Amazon Linux,
     install Node.js and developer tools, and build the extensions using Docker.
     Run `make all`.

2. Deploy the CloudFormation stack (see last section for manual deployment)

    Run `bin/deploy` to deploy the CloudFormation stack. It will create a
    temporary Amazon S3 bucket, package and upload the function, and create the
    Lambda function, Amazon API Gateway RestApi, and an S3 bucket for images via
    CloudFormation.

    The deployment script requires the [AWS CLI][cli] version 1.11.19 or newer
    to be installed.

3. Test the function

    Upload an image to the S3 bucket and try to resize it via your web browser
    to different sizes, e.g. with an image uploaded in the bucket called
    image.png:

    - http://[BucketWebsiteHost]/300x300/path/to/image.png
    - http://[BucketWebsiteHost]/90x90/path/to/image.png
    - http://[BucketWebsiteHost]/40x40/path/to/image.png

    You can find the `BucketWebsiteUrl` in the table of outputs displayed on a
    successful invocation of the deploy script.

4. (Optional) Restrict resize dimensions

    To restrict the dimensions the function will create, set the environment
    variable `ALLOWED_DIMENSIONS` to a string in the format
    *(HEIGHT)x(WIDTH),(HEIGHT)x(WIDTH),...*.

    For example: *300x300,90x90,40x40*.

## Manual Deployment

More information at https://aws.amazon.com/blogs/compute/resize-images-on-the-fly-with-amazon-s3-aws-lambda-and-amazon-api-gateway/

```xml
<RoutingRules>
    <RoutingRule>
        <Condition>
            <KeyPrefixEquals/>
            <HttpErrorCodeReturnedEquals>404</HttpErrorCodeReturnedEquals>
        </Condition>
        <Redirect>
            <Protocol>https</Protocol>
            <HostName>__YOUR_API_HOSTNAME_HERE__</HostName>
            <ReplaceKeyPrefixWith>prod/resize?key=</ReplaceKeyPrefixWith>
            <HttpRedirectCode>307</HttpRedirectCode>
        </Redirect>
    </RoutingRule>
</RoutingRules>
```

* Create destination bucket
* Give destination bucket static website permission and make it public
* Add redirection to the static hosting configuration


* Create lambda
* Give read permissions to source bucket (where the original files exist)
* Give read and write permission to destination bucket (where the thumbnails are going to live)

* Configure the following properties in the lambda

#### SOURCE_BUCKET

Where the originals reside

#### THUMBNAIL_DESTINATION_BUCKET

Where the thumbnails are going to reside

#### URL

The cloud front URL

#### VIDEO_SCREENSHOT_TIME_MARK (Optional)

At what second of the video the screenshot is taken, defaults to 3

#### DEFAULT_VIDEO_CHUNK_SIZE

The default chunk size of the video (this is a chunk of the video needed for metadata) defaults to 10200



## License

This reference architecture sample is [licensed][license] under Apache 2.0.

[license]: LICENSE
[sharp]: https://github.com/lovell/sharp
[amazon-linux]: https://aws.amazon.com/blogs/compute/nodejs-packages-in-lambda/
[cli]: https://aws.amazon.com/cli/
