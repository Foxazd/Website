import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const DeleteCommentModal = ({ show, handleClose, handleDelete, deleteReason, setDeleteReason }) => (
    <Modal show={show} onHide={handleClose} backdrop="static" className="modal-delete">
        <Modal.Header closeButton>
            <Modal.Title>Nhập lý do xóa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group controlId="deleteReason">
                    <Form.Label>Lý do xóa bình luận</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                    />
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Hủy bỏ</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa bình luận</Button>
        </Modal.Footer>
    </Modal>
);

export default DeleteCommentModal;
