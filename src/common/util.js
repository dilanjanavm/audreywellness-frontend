import React from "react";

export const onlyDigit = new RegExp("^\\d+$");
export const emailRegex =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const regex = /^(?=.*(?:http|https|\/\/|:|\s)).*$/;
export const checkWebCondition = (string) => {
  return regex.test(string);
};
export const registerPasswordRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,}$)"
);
export const passwordRegex = (password) => {
  const regex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;
  return regex.test(password);
};
export const basicContactNumberValidator = (identity) => {
  let mobileNumRegex = new RegExp("^(0)[0-9]{9}$|^(07)[0-9]{8}$");
  return mobileNumRegex.test(identity);
};

export const customMobileValidation = (number, condition) => {
  let result = condition;
  if (!result) {
    let reg = new RegExp("^(9474)[0-9]{7}$");
    result = reg.test(number);
  }
  return result;
};

export const mobileNumberInputValidation = (
  currentValue,
  preValue,
  condition
) => {
  let reg = new RegExp("^\\+[0-9]*$|^[0-9]*$");
  return (
    reg.test(currentValue) &&
    (!condition || currentValue.length < preValue.length)
  );
};

export const charityProgramURLValidation = (value) => {
  if (value) {
    let reg = /[&:?]/g;
    return reg.test(value);
  } else {
    return false;
  }
};

export const desMaxLimit = 2500;
