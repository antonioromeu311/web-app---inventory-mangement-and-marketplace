/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { Products } from "../models";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function ProductsUpdateForm(props) {
  const {
    id: idProp,
    products: productsModelProp,
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
    const cleanValues = productsRecord
      ? { ...initialValues, ...productsRecord }
      : initialValues;
    setName(cleanValues.name);
    setDescription(cleanValues.description);
    setPrice(cleanValues.price);
    setClassification(cleanValues.classification);
    setAmountOnHand(cleanValues.amountOnHand);
    setAmountCommit(cleanValues.amountCommit);
    setAmountTotal(cleanValues.amountTotal);
    setSystemTag(cleanValues.systemTag);
    setErrors({});
  };
  const [productsRecord, setProductsRecord] = React.useState(productsModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? await DataStore.query(Products, idProp)
        : productsModelProp;
      setProductsRecord(record);
    };
    queryData();
  }, [idProp, productsModelProp]);
  React.useEffect(resetStateValues, [productsRecord]);
  const validations = {
    name: [],
    description: [],
    price: [],
    classification: [],
    amountOnHand: [],
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
          await DataStore.save(
            Products.copyOf(productsRecord, (updated) => {
              Object.assign(updated, modelFields);
            })
          );
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "ProductsUpdateForm")}
      {...rest}
    >
      <TextField
        label="Name"
        isRequired={false}
        isReadOnly={false}
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
      <TextField
        label="Description"
        isRequired={false}
        isReadOnly={false}
        value={description}
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
      ></TextField>
      <TextField
        label="Price"
        isRequired={false}
        isReadOnly={false}
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
        label="Classification"
        isRequired={false}
        isReadOnly={false}
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
      <TextField
        label="Amount on hand"
        isRequired={false}
        isReadOnly={false}
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
        label="Amount commit"
        isRequired={false}
        isReadOnly={false}
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
        label="Amount total"
        isRequired={false}
        isReadOnly={false}
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
        label="System tag"
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
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || productsModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || productsModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
