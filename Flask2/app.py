import os
import io
import base64
import boto3
from boto3.session import Session
import flask
from typing import List
import numpy as np
from PIL import Image
from flask import Flask, request, render_template, jsonify, make_response, stream_with_context, Response, redirect, url_for, flash
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
from boto.s3.connection import S3Connection
from boto.s3 import key

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = set(['png', 'jpeg', 'jpg', 'gif'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# AWS s3へ保存する
BUCKET_NAME = 'draw-avater-hair'
AWS_ACCESS_ID = os.environ.get("AWS_ACCESS_ID")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY")
conn = S3Connection(AWS_ACCESS_ID, AWS_SECRET_KEY)
bucket = conn.get_bucket(BUCKET_NAME)

profile = "iam_t_nakamura"
session = Session(profile_name=profile)

#保存名用のカウンター
count = 0

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def is_empty_dict(dct):
    return not bool(dct)

def load_images(req):
    """
    Parse images from request and return List of images of np.ndarray.
    :param req: flask.request
    :return: List[np.ndarray]
    """
    #images = []
    if not is_empty_dict(req.files):
        """for multi images with files"""
        for key, v in req.file.items():
            imgfile = Image.open(io.BytesIO(v.read()))
            #img = np.array(imgfile)
            #img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            #images.append(img)
            return imgfile
    elif not is_empty_dict(req.form):
        """for multi images with from-data"""
        for key, v in req.form.items():
            data = base64.b64decode(v)
            imgfile = Image.open(io.BytesIO(data))
            #img = np.array(imgfile)
            #img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            #images.append(img)
            return imgfile
    else:
        """for one image."""
        decode_imgfile = base64.b64decode(req.data)
        byte_imgfile = io.BytesIO(decode_imgfile)
        imgfile = Image.open(byte_imgfile)  # img is PIL ImageFile
        #img = np.array(imgfile)
        #img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        #images.append(img)
        return imgfile

    #return images

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        global count
        imgfile = load_images(request)
        img_name = "{}.jpg".format(count)
        imgfile.save(os.path.join(app.config['UPLOAD_FOLDER'], img_name))
        # imgfileをfileobjに変換しないといけない!!!!!
        #s3.meta.client.upload_file(imgfile, 'draw-avater-hair', '{}.jpg'.format(count))

        k = key.Key(bucket, '{}.jpg'.format(count))
        imgfile.thumbnail((60,60), Image.ANTIALIAS)
        out = io.BytesIO()
        imgfile.save(out, "JPEG")
        k.set_contents_from_string(out.getvalue(), headers={"Content-Type": "image/jpeg"})

        count += 1
        return render_template('complete.html')
    elif request.method == 'GET':
        return render_template('upload.html')

if __name__ == '__main__':
    CORS(app)
    app.run(port=4000, host="0.0.0.0", debug=True)
