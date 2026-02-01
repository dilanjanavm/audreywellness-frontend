import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useDispatch } from "react-redux";
import { updateSetting } from "../../../service/settingService";

const UpdateSettingsModel = ({ isOpen, currentData, onClose }) => {
  const [settingValue, setSettingValue] = useState("");

  let dispatch = useDispatch();

  useEffect(() => {
    setSettingValue(currentData.value);
  }, [isOpen]);

  const handleUpdateSetting = () => {
    let isValidated = false;

    settingValue === ""
      ? customToastMsg("Setting value cannot be empty")
      : (isValidated = true);

    const data = {
      value: settingValue,
      status: currentData?.status,
    };

    if (isValidated) {
      popUploader(dispatch, true);
      updateSetting(currentData.id, data)
        .then((response) => {
          popUploader(dispatch, false);
          onClose();
          setSettingValue("");
          customToastMsg("Setting successfully updated ", 1);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          handleError(err);
        });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      toggle={() => {
        onClose();
      }}
    >
      <ModalHeader
        toggle={() => {
          onClose();
        }}
      >
        Update Setting
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="settingValue">{currentData?.key}</Label>
            {currentData?.type === "number" ? (
              <Input
                type="number"
                id="settingValue"
                placeholder="Enter setting value"
                value={settingValue}
                onChange={(e) => setSettingValue(e.target.value)}
              />
            ) : currentData?.type === "string" ? (
              <Input
                type="text"
                id="settingValue"
                placeholder="Enter setting value"
                value={settingValue}
                onChange={(e) => setSettingValue(e.target.value)}
              />
            ) : currentData?.type === "html" ? (
              <CKEditor
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setSettingValue(data);
                }}
                config={{
                  toolbar: {
                    items: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "underline",
                      "strikethrough",
                      "|",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "alignment",
                      "|",
                      "indent",
                      "outdent",
                      "|",
                      "fontColor",
                      "fontSize",
                      "fontBackgroundColor",
                      "|",
                      "undo",
                      "redo",
                      "|",
                      "cut",
                      "copy",
                      "paste",
                      "|",
                      "removeFormat",
                      "|",
                      "blockQuote",
                      "horizontalLine",
                      "|",
                      "code",
                      "|",
                      "specialCharacters",
                      "|",
                    ],
                  },
                }}
                editor={ClassicEditor}
                data={settingValue}
                onReady={(editor) => {}}
              />
            ) : (
              ""
            )}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={() => {
            onClose();
            setSettingValue("");
          }}
        >
          Cancel
        </Button>{" "}
        <Button color="primary" onClick={handleUpdateSetting}>
          Update {currentData?.key}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UpdateSettingsModel;
