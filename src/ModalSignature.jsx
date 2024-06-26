// src/Signature.js
import React, { useRef, useState } from 'react';
import { Modal, Button, Input } from 'antd';
import { SketchPicker } from 'react-color';
import SignaturePad from 'react-signature-canvas';

const ModalSignature = () => {
  const [visible, setVisible] = useState(false);
  const [color, setColor] = useState('#000000');
  const [signatureData, setSignatureData] = useState('');
  const sigPad = useRef(null);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setSignatureData(sigPad.current.getTrimmedCanvas().toDataURL('image/png'));
    setVisible(false);
  };

  const handleClear = () => {
    sigPad.current.clear();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Signature
      </Button>
      <Modal
        title="Signature"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="clear" onClick={handleClear}>
            Clear
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Accept and sign
          </Button>,
        ]}
      >
        {/* <SketchPicker color={color} onChangeComplete={handleColorChange} /> */}
        <div style={{ border: '1px solid #000', marginTop: '10px' }}>
          <SignaturePad
            ref={sigPad}
            penColor={color}
            canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
          />
        </div>
      </Modal>
      {signatureData && (
        <div style={{ marginTop: '10px' }}>
          <img src={signatureData} alt="Signature" />
        </div>
      )}
    </div>
  );
};

export default ModalSignature;
