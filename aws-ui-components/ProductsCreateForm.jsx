/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  TextAreaField,
  TextField,
} from "@aws-amplify/ui-react";
import { Products } from "../models";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function ProductsCreateForm(props) {
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
    name: "",
    description: "",
    price: "",
    classification: "",
    amountOnHand: "",
    amountCommit: "",
    amountTotal: "",
    systemTag: "",
  };
  const [name, setName] = React.useState(initialValues.name);
  const [description, setDescription] = React.useState(
    initialValues.description
  );
  const [price, setPrice] = React.useState(initialValues.price);
  const [classification, setClassification] = React.useState(
    initialValues.classification
  );
  const [amountOnHand, setAmountOnHand] = React.useState(
    initialValues.amountOnHand
  );
  const [amountCommit, setAmountCommit] = React.useState(
    initialValues.amountCommit
  );
  const [amountTotal, setAmountTotal] = React.useState(
    initialValues.amountTotal
  );
  const [systemTag, setSystemTag] = React.useState(initialValues.systemTag);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setName(initialValues.name);
    setDescription(initialValues.description);
    setPrice(initialValues.price);
    setClassification(initialValues.classification);
    setAmountOnHand(initialValues.amountOnHand);
    setAmountCommit(initialValues.amountCommit);
    setAmountTotal(initialValues.amountTotal);
    setSystemTag(initialValues.systemTag);
    setErrors({});
  };
  const validations = {
    name: [{ type: "Required" }],
    description: [{ type: "Required" }],
    price: [
      { type: "Required" },
      {
        type: "GreaterThanNum",
        numValues: [0],
        validationMessage: "The value must be greater than 0",
      },
    ],
    classification: [
      { type: "Required" },
      {
        type: "Contains",
        strValues: ["SW", "FW", "FE", "OT"],
        validationMessage:
          'The value must contain "SW" or "FW" or "FE" or "OT"',
      },
    ],
    amountOnHand: [{ type: "Required" }],
    amountCommit: [],
    amountTotal: [],
    systemTag: [],
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
          name,
          description,
          price,
          classification,
          amountOnHand,
          amountCommit,
          amountTotal,
          systemTag,
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
          await DataStore.save(new Products(modelFields));
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
      {...getOverrideProps(overrides, "ProductsCreateForm")}
      {...rest}
    >
      <Heading
        level={5}
        children="Create a Product"
        {...getOverrideProps(overrides, "SectionalElement0")}
      ></Heading>
      <Divider
        orientation="horizontal"
        {...getOverrideProps(overrides, "SectionalElement1")}
      ></Divider>
      <TextField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Title</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        descriptiveText="Title to be displayed to customer and for search reference"
        isRequired={true}
        isReadOnly={false}
        placeholder="Carribean Flounder"
        value={name}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name: value,
              description,
              price,
              classification,
              amountOnHand,
              amountCommit,
              amountTotal,
              systemTag,
            };
            const result = onChange(modelFields);
            value = result?.name ?? value;
          }
          if (errors.name?.hasError) {
            runValidationTasks("name", value);
          }
          setName(value);
        }}
        onBlur={() => runValidationTasks("name", name)}
        errorMessage={errors.name?.errorMessage}
        hasError={errors.name?.hasError}
        {...getOverrideProps(overrides, "name")}
      ></TextField>
      <TextAreaField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Description</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        descriptiveText="Info for customers"
        isRequired={true}
        isReadOnly={false}
        placeholder="The Carribean Flounder requires ..."
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              description: value,
              price,
              classification,
              amountOnHand,
              amountCommit,
              amountTotal,
              systemTag,
            };
            const result = onChange(modelFields);
            value = result?.description ?? value;
          }
          if (errors.description?.hasError) {
            runValidationTasks("description", value);
          }
          setDescription(value);
        }}
        onBlur={() => runValidationTasks("description", description)}
        errorMessage={errors.description?.errorMessage}
        hasError={errors.description?.hasError}
        {...getOverrideProps(overrides, "description")}
      ></TextAreaField>
      <Divider
        orientation="horizontal"
        {...getOverrideProps(overrides, "SectionalElement2")}
      ></Divider>
      <TextField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Price WHOLESALE (auto adjusted for retail to customer)</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        descriptiveText="$25.00 = 2500, simply no decimal or $"
        isRequired={true}
        isReadOnly={false}
        placeholder="2500"
        type="number"
        step="any"
        value={price}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              price: value,
              classification,
              amountOnHand,
              amountCommit,
              amountTotal,
              systemTag,
            };
            const result = onChange(modelFields);
            value = result?.price ?? value;
          }
          if (errors.price?.hasError) {
            runValidationTasks("price", value);
          }
          setPrice(value);
        }}
        onBlur={() => runValidationTasks("price", price)}
        errorMessage={errors.price?.errorMessage}
        hasError={errors.price?.hasError}
        {...getOverrideProps(overrides, "price")}
      ></TextField>
      <TextField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Classification</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        descriptiveText="SW = Saltwater, FW = Freshwater, FE = Food&Equipment, OT = Other(Invoice etc)"
        isRequired={true}
        isReadOnly={false}
        placeholder="FW"
        value={classification}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              description,
              price,
              classification: value,
              amountOnHand,
              amountCommit,
              amountTotal,
              systemTag,
            };
            const result = onChange(modelFields);
            value = result?.classification ?? value;
          }
          if (errors.classification?.hasError) {
            runValidationTasks("classification", value);
          }
          setClassification(value);
        }}
        onBlur={() => runValidationTasks("classification", classification)}
        errorMessage={errors.classification?.errorMessage}
        hasError={errors.classification?.hasError}
        {...getOverrideProps(overrides, "classification")}
      ></TextField>
      <Divider
        orientation="horizontal"
        {...getOverrideProps(overrides, "SectionalElement3")}
      ></Divider>
      <Heading
        children="The following fields are *REQUIRED* for inventory items, but not for invoices/other"
        {...getOverrideProps(overrides, "SectionalElement4")}
      ></Heading>
      <TextField
        label={
          <span style={{ display: "inline-flex" }}>
            <span>Amount On Hand</span>
            <span style={{ color: "red" }}>*</span>
          </span>
        }
        isRequired={true}
        isReadOnly={false}
        placeholder="15"
        type="number"
        step="any"
        value={amountOnHand}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              price,
              classification,
              amountOnHand: value,
              amountCommit,
              amountTotal,
              systemTag,
            };
            const result = onChange(modelFields);
            value = result?.amountOnHand ?? value;
          }
          if (errors.amountOnHand?.hasError) {
            runValidationTasks("amountOnHand", value);
          }
          setAmountOnHand(value);
        }}
        onBlur={() => runValidationTasks("amountOnHand", amountOnHand)}
        errorMessage={errors.amountOnHand?.errorMessage}
        hasError={errors.amountOnHand?.hasError}
        {...getOverrideProps(overrides, "amountOnHand")}
      ></TextField>
      <TextField
        label="Amount Committed"
        descriptiveText="Amount of product committed, NOT to be counted in the available inv count"
        isRequired={false}
        isReadOnly={false}
        placeholder="10"
        type="number"
        step="any"
        value={amountCommit}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              price,
              classification,
              amountOnHand,
              amountCommit: value,
              amountTotal,
              systemTag,
            };
            const result = onChange(modelFields);
            value = result?.amountCommit ?? value;
          }
          if (errors.amountCommit?.hasError) {
            runValidationTasks("amountCommit", value);
          }
          setAmountCommit(value);
        }}
        onBlur={() => runValidationTasks("amountCommit", amountCommit)}
        errorMessage={errors.amountCommit?.errorMessage}
        hasError={errors.amountCommit?.hasError}
        {...getOverrideProps(overrides, "amountCommit")}
      ></TextField>
      <TextField
        label="Amount Total Available"
        descriptiveText="Amount available for customer purchase"
        isRequired={false}
        isReadOnly={false}
        placeholder="5"
        type="number"
        step="any"
        value={amountTotal}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              name,
              description,
              price,
              classification,
              amountOnHand,
              amountCommit,
              amountTotal: value,
              systemTag,
            };
            const result = onChange(modelFields);
            value = result?.amountTotal ?? value;
          }
          if (errors.amountTotal?.hasError) {
            runValidationTasks("amountTotal", value);
          }
          setAmountTotal(value);
        }}
        onBlur={() => runValidationTasks("amountTotal", amountTotal)}
        errorMessage={errors.amountTotal?.errorMessage}
        hasError={errors.amountTotal?.hasError}
        {...getOverrideProps(overrides, "amountTotal")}
      ></TextField>
      <TextField
        label="System Tag / SKU"
        descriptiveText="A custom tag for marking certain aquariam systems, or SKU, or any searchable tags"
        isRequired={false}
        isReadOnly={false}
        value={systemTag}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              description,
              price,
              classification,
              amountOnHand,
              amountCommit,
              amountTotal,
              systemTag: value,
            };
            const result = onChange(modelFields);
            value = result?.systemTag ?? value;
          }
          if (errors.systemTag?.hasError) {
            runValidationTasks("systemTag", value);
          }
          setSystemTag(value);
        }}
        onBlur={() => runValidationTasks("systemTag", systemTag)}
        errorMessage={errors.systemTag?.errorMessage}
        hasError={errors.systemTag?.hasError}
        {...getOverrideProps(overrides, "systemTag")}
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
            children="Create"
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
