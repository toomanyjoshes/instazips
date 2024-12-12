# Instagram Content Downloader

A web application that allows users to download media, captions, and comments from Instagram posts.

## Features

- Download images and videos from Instagram posts
- Save post captions as text files
- Export comments to Excel spreadsheets
- Package all content in a convenient ZIP file

## Deployment Options

### 1. Python Anywhere (Recommended for beginners)

1. Create an account on [PythonAnywhere](https://www.pythonanywhere.com/)
2. Upload your project files
3. Create a new web app using Flask
4. Set up your virtual environment:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.8 myenv
   pip install -r requirements.txt
   ```
5. Configure your WSGI file to point to wsgi.py
6. Set up your environment variables in the web app configuration

### 2. Heroku

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login to Heroku:
   ```bash
   heroku login
   ```
3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
4. Set up environment variables:
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set INSTAGRAM_USERNAME=your-instagram-username
   heroku config:set INSTAGRAM_PASSWORD=your-instagram-password
   ```
5. Deploy your application:
   ```bash
   git push heroku main
   ```

### 3. DigitalOcean App Platform

1. Create a DigitalOcean account
2. Create a new App
3. Connect your GitHub repository
4. Set up environment variables in the App settings
5. Deploy your application

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

- `SECRET_KEY`: Flask secret key for session management
- `PORT`: Application port (default: 5000)
- `INSTAGRAM_USERNAME`: (Optional) Instagram username for accessing private posts
- `INSTAGRAM_PASSWORD`: (Optional) Instagram password

## Notes

- Some posts may require authentication to access. Configure Instagram credentials in your environment variables if needed.
- The application has a file size limit of 16MB for uploads.
- Temporary files are automatically cleaned up after each download.

## License

MIT License
