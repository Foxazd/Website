import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditCommentModal = ({ show, handleClose, handleUpdate, editedContent, setEditedContent }) => (
    <Modal 
        show={show} 
        onHide={handleClose} 
        backdrop="false"  
        className="modal-edit"
    >
        <Modal.Header closeButton>
            <Modal.Title>Chỉnh sửa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleUpdate}>
                <Form.Group controlId="editedContent">
                    <Form.Label>Nội dung bình luận</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">Cập nhật</Button>
            </Form>
        </Modal.Body>
    </Modal>
);

export default EditCommentModal;
