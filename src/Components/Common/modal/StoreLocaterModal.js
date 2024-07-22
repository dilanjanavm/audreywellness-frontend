import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import {
  customToastMsg,
  handleError,
  popUploader,
} from "../../../common/commonFunctions";
import Select from "react-select";
import { Switch } from "antd";
import { useDispatch } from "react-redux";
import { getAllCountries } from "../../../service/countryService";
import { createStore, updateStore } from "../../../service/storeLocaterService";

const StoreLocaterModal = ({ isOpen, toggle, updateValue, isUpdate }) => {
  const [isDone, setIsDone] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryList, setCountryList] = useState([]);
  const [locationUrl, setLocationUrl] = useState("");

  let dispatch = useDispatch();

  useEffect(() => {
    loadAllCountries();
    if (isUpdate) {
      let isSetData = setUpdateDetails();
      setIsDone(isSetData);
    } else {
      setIsDone(true);
    }
  }, [isOpen]);

  const setUpdateDetails = async () => {
    await setStoreName(updateValue?.title);
    await setAddress(updateValue?.addressLine);
    await setCity(updateValue?.city);
    await setPostalCode(updateValue?.postalCode);
    await setSelectedCountry(updateValue?.country);
    await setLocationUrl(updateValue?.url);
    return true;
  };

  const closeModal = async () => {
    toggle(updateValue);
    await setStoreName("");
    await setAddress("");
    await setCity("");
    await setPostalCode("");
    await setLocationUrl("");
  };

  const loadAllCountries = () => {
    setCountryList([]);
    console.log("method called");
    getAllCountries()
      .then((res) => {
        let temp = [];
        res?.data.map((country, index) => {
          temp.push({ value: country.dialCode, label: country.countryName });
        });
        setCountryList(temp);
      })
      .catch((err) => {
        console.log(err);
        handleError(err);
      });
  };

  const saveNewStoreLocater = () => {
    let isValidated = false;

    storeName === ""
      ? customToastMsg("Store name cannot be empty")
      : address === ""
      ? customToastMsg("Address cannot be empty")
      : city === ""
      ? customToastMsg("City name no cannot be empty")
      : postalCode === ""
      ? customToastMsg("Postal code cannot be empty")
      : locationUrl === ""
      ? customToastMsg("Location url cannot be empty")
      : (isValidated = true);

    const data = {
      title: storeName,
      addressLine: address,
      city: city,
      country: selectedCountry,
      url: locationUrl,
      postalCode: postalCode,
    };

    if (isValidated) {
      popUploader(dispatch, true);
      createStore(data)
        .then((res) => {
          popUploader(dispatch, false);
          closeModal();
          customToastMsg("Store successfully create", 1);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          handleError(err);
        });
    }
  };

  const updateStoreLocaterDetails = () => {
    let isValidated = false;

    storeName === ""
      ? customToastMsg("First name cannot be empty")
      : address === ""
      ? customToastMsg("Address cannot be empty")
      : city === ""
      ? customToastMsg("City name no cannot be empty")
      : postalCode === ""
      ? customToastMsg("Postal code cannot be empty")
      : locationUrl === ""
      ? customToastMsg("Location url cannot be empty")
      : (isValidated = true);

    const data = {
      title: storeName,
      addressLine: address,
      city: city,
      country: selectedCountry,
      url: locationUrl,
      postalCode: postalCode,
    };

    if (isValidated) {
      popUploader(dispatch, true);
      updateStore(updateValue.id, data)
        .then((res) => {
          popUploader(dispatch, false);
          closeModal();
          customToastMsg("Store successfully updated", 1);
        })
        .catch((err) => {
          popUploader(dispatch, false);
          handleError(err);
        });
    }
  };

  return (
    <Modal isOpen={isOpen} size="lg" toggle={(e) => closeModal()}>
      {isUpdate ? (
        <ModalHeader toggle={(e) => closeModal()}>Update Store</ModalHeader>
      ) : (
        <ModalHeader toggle={(e) => closeModal()}>Add New Store</ModalHeader>
      )}

      {isDone && (
        <ModalBody>
          <Form className="row">
            <FormGroup className="col-12 col-lg-6">
              <Label for="storeName">Store Name</Label>
              <Input
                type="text"
                id="storeName"
                placeholder="Enter store name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </FormGroup>
            <FormGroup className="col-12 col-lg-6">
              <Label for="address">Address</Label>
              <Input
                type="text"
                id="address"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </FormGroup>
            <FormGroup className="col-12 col-lg-6">
              <Label for="city">City</Label>
              <Input
                type="text"
                id="city"
                placeholder="Enter city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </FormGroup>

            <FormGroup className="col-12 col-lg-6">
              <Label for="postalCode">Postal Code</Label>
              <Input
                type="number"
                id="postalCode"
                placeholder="Enter postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </FormGroup>

            <FormGroup className="col-12 col-lg-6">
              <Label for="role">Select Country</Label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                isClearable
                value={
                  countryList.find(
                    (option) => option.label === selectedCountry
                  ) || null
                }
                onChange={(e) => {
                  setSelectedCountry(
                    e?.value === undefined ? "" : e === null ? "" : e.label
                  );
                }}
                options={countryList}
              />
            </FormGroup>

            <FormGroup className="col-12 col-lg-6">
              <Label for="mapUrl">Location URL</Label>
              <Input
                type="url"
                id="mapUrl"
                placeholder="Enter goggle map location URL"
                value={locationUrl}
                onChange={(e) => setLocationUrl(e.target.value)}
              />
            </FormGroup>
          </Form>
        </ModalBody>
      )}
      <ModalFooter>
        <Button onClick={(e) => closeModal()}>Cancel</Button>
        {isUpdate ? (
          <Button
            onClick={() => {
              updateStoreLocaterDetails();
            }}
            color="primary"
          >
            Update Store
          </Button>
        ) : (
          <Button
            onClick={() => {
              saveNewStoreLocater();
            }}
            color="primary"
          >
            Add New Store
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default StoreLocaterModal;
