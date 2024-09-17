/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { QBOtokens } from "../models";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function QBOtokensCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    accessToken: "",
    realmID: "",
    refreshToken: "",
    nameQBO: "",
  };
  const [accessToken, setAccessToken] = React.useState(
    initialValues.accessToken
  );
  const [realmID, setRealmID] = React.useState(initialValues.realmID);
  const [refreshToken, setRefreshToken] = React.useState(
    initialValues.refreshToken
  );
  const [nameQBO, setNameQBO] = React.useState(initialValues.nameQBO);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setAccessToken(initialValues.accessToken);
    setRealmID(initialValues.realmID);
    setRefreshToken(initialValues.refreshToken);
    setNameQBO(initialValues.nameQBO);
    setErrors({});
  };
  const validations = {
    accessToken: [{ type: "Required" }],
    realmID: [{ type: "Required" }],
    refreshToken: [{ type: "Required" }],
    nameQBO: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          accessToken,
          realmID,
          refreshToken,
          nameQBO,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await DataStore.save(new QBOtokens(modelFields));
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "QBOtokensCreateForm")}
      {...rest}
    >
      <TextField
        label="Access token"
        isRequired={true}
        isReadOnly={false}
        value={accessToken}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              accessToken: value,
              realmID,
              refreshToken,
              nameQBO,
            };
            const result = onChange(modelFields);
            value = result?.accessToken ?? value;
          }
          if (errors.accessToken?.hasError) {
            runValidationTasks("accessToken", value);
          }
          setAccessToken(value);
        }}
        onBlur={() => runValidationTasks("accessToken", accessToken)}
        errorMessage={errors.accessToken?.errorMessage}
        hasError={errors.accessToken?.hasError}
        {...getOverrideProps(overrides, "accessToken")}
      ></TextField>
      <TextField
        label="Realm id"
        isRequired={true}
        isReadOnly={false}
        value={realmID}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              accessToken,
              realmID: value,
              refreshToken,
              nameQBO,
            };
            const result = onChange(modelFields);
            value = result?.realmID ?? value;
          }
          if (errors.realmID?.hasError) {
            runValidationTasks("realmID", value);
          }
          setRealmID(value);
        }}
        onBlur={() => runValidationTasks("realmID", realmID)}
        errorMessage={errors.realmID?.errorMessage}
        hasError={errors.realmID?.hasError}
        {...getOverrideProps(overrides, "realmID")}
      ></TextField>
      <TextField
        label="Refresh token"
        isRequired={true}
        isReadOnly={false}
        value={refreshToken}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              accessToken,
              realmID,
              refreshToken: value,
              nameQBO,
            };
            const result = onChange(modelFields);
            value = result?.refreshToken ?? value;
          }
          if (errors.refreshToken?.hasError) {
            runValidationTasks("refreshToken", value);
          }
          setRefreshToken(value);
        }}
        onBlur={() => runValidationTasks("refreshToken", refreshToken)}
        errorMessage={errors.refreshToken?.errorMessage}
        hasError={errors.refreshToken?.hasError}
        {...getOverrideProps(overrides, "refreshToken")}
      ></TextField>
      <TextField
        label="Name qbo"
        isRequired={false}
        isReadOnly={false}
        value={nameQBO}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              accessToken,
              realmID,
              refreshToken,
              nameQBO: value,
            };
            const result = onChange(modelFields);
            value = result?.nameQBO ?? value;
          }
          if (errors.nameQBO?.hasError) {
            runValidationTasks("nameQBO", value);
          }
          setNameQBO(value);
        }}
        onBlur={() => runValidationTasks("nameQBO", nameQBO)}
        errorMessage={errors.nameQBO?.errorMessage}
        hasError={errors.nameQBO?.hasError}
        {...getOverrideProps(overrides, "nameQBO")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
