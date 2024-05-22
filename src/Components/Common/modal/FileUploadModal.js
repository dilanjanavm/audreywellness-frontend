import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import styles from '../../../assets/scss/custom/FileUploadModal.module.scss';

import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;
const props = {
    name: 'file',
    multiple: true,
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange(info) {
        const { status } = info.file;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
    onDrop(e) {
        console.log('Dropped files', e.dataTransfer.files);
    },
};

import * as fileService from "../../../service/fileService";

export default function FileUploadModal() {
    const [modal, setModal] = useState(false);
    const [isMediaCenterOpen, setIsMediaCenterOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    const toggle = () => setModal(!modal);

    useEffect(() => {
        getAll();
    }, []);

    const getAll = () => {
        fileService
            .getAll()
            .then((res) => {
                const imagesArray = res.data.records; // Assuming records is an array of images
                setImages(imagesArray);
                console.log("images : ", imagesArray);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleImageClick = (image) => {
        setSelectedImage((prevSelectedImage) => {
            const newSelectedImage = prevSelectedImage === image.id ? null : image.id;
            console.log("Selected image:", newSelectedImage);
            return newSelectedImage;
        });
    };

    return (
        <div>
            <Button color="secondary" onClick={toggle}>
                Upload Image
            </Button>


            <Modal isOpen={modal} toggle={toggle} size={'lg'}>
                <ModalHeader toggle={toggle}>Choose an image</ModalHeader>
                <ModalBody>
                    <Button onClick={() => { setIsMediaCenterOpen(false) }}>Local upload</Button>
                    <Button onClick={() => { setIsMediaCenterOpen(true) }}>Media center</Button>
                    <hr />

                    {isMediaCenterOpen ?
                        <div>
                            <div>
                                <ul className={styles.imageList}>
                                    {images.map((image) => (
                                        <div key={image.id}
                                            className={`${styles.imageItem} ${selectedImage === image.id ? 'selected' : ''}`}
                                            onClick={() => handleImageClick(image)}>

                                            <img
                                                src={image.smallPath}
                                                alt={image.originalName}
                                                className={`${styles.imageItem}`}
                                            />
                                        </div>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        : <Dragger {...props}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">
                                Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                                banned files.
                            </p>
                        </Dragger>
                    }

                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={toggle}>
                        Confirm upload
                    </Button>{' '}
                    <Button color="secondary" onClick={toggle}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}
