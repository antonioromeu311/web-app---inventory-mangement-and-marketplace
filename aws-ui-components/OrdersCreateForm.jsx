/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Badge,
  Button,
  Divider,
  Flex,
  Grid,
  Icon,
  ScrollView,
  SwitchField,
  Text,
  TextField,
  useTheme,
} from "@aws-amplify/ui-react";
import { Orders } from "../models";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { DataStore } from "aws-amplify";
function ArrayField({
  items = [],
  onChange,
  label,
  inputFieldRef,
  children,
  hasError,
  setFieldValue,
  currentFieldValue,
  defaultFieldValue,
  lengthLimit,
  getBadgeText,
  runValidationTasks,
  errorMessage,
}) {
  const labelElement = <Text>{label}</Text>;
  const {
    tokens: {
      components: {
        fieldmessages: { error: errorStyles },
      },
    },
  } = useTheme();
  const [selectedBadgeIndex, setSelectedBadgeIndex] = React.useState();
  const [isEditing, setIsEditing] = React.useState();
  React.useEffect(() => {
    if (isEditing) {
      inputFieldRef?.current?.focus();
    }
  }, [isEditing]);
  const removeItem = async (removeIndex) => {
    const newItems = items.filter((value, index) => index !== removeIndex);
    await onChange(newItems);
    setSelectedBadgeIndex(undefined);
  };
  const addItem = async () => {
    const { hasError } = runValidationTasks();
    if (
      currentFieldValue !== undefined &&
      currentFieldValue !== null &&
      currentFieldValue !== "" &&
      !hasError
    ) {
      const newItems = [...items];
      if (selectedBadgeIndex !== undefined) {
        newItems[selectedBadgeIndex] = currentFieldValue;
        setSelectedBadgeIndex(undefined);
      } else {
        newItems.push(currentFieldValue);
      }
      await onChange(newItems);
      setIsEditing(false);
    }
  };
  const arraySection = (
    <React.Fragment>
      {!!items?.length && (
        <ScrollView height="inherit" width="inherit" maxHeight={"7rem"}>
          {items.map((value, index) => {
            return (
              <Badge
                key={index}
                style={{
                  cursor: "pointer",
                  alignItems: "center",
                  marginRight: 3,
                  marginTop: 3,
                  backgroundColor:
                    index === selectedBadgeIndex ? "#B8CEF9" : "",
                }}
                onClick={() => {
                  setSelectedBadgeIndex(index);
                  setFieldValue(items[index]);
                  setIsEditing(true);
                }}
              >
                {getBadgeText ? getBadgeText(value) : value.toString()}
                <Icon
                  style={{
                    cursor: "pointer",
                    paddingLeft: 3,
                    width: 20,
                    height: 20,
                  }}
                  viewBox={{ width: 20, height: 20 }}
                  paths={[
                    {
                      d: "M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z",
                      stroke: "black",
                    },
                  ]}
                  ariaLabel="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(index);
                  }}
                />
              </Badge>
            );
          })}
        </ScrollView>
      )}
      <Divider orientation="horizontal" marginTop={5} />
    </React.Fragment>
  );
  if (lengthLimit !== undefined && items.length >= lengthLimit && !isEditing) {
    return (
      <React.Fragment>
        {labelElement}
        {arraySection}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      {labelElement}
      {isEditing && children}
      {!isEditing ? (
        <>
          <Button
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Add item
          </Button>
          {errorMessage && hasError && (
            <Text color={errorStyles.color} fontSize={errorStyles.fontSize}>
              {errorMessage}
            </Text>
          )}
        </>
      ) : (
        <Flex justifyContent="flex-end">
          {(currentFieldValue || isEditing) && (
            <Button
              children="Cancel"
              type="button"
              size="small"
              onClick={() => {
                setFieldValue(defaultFieldValue);
                setIsEditing(false);
                setSelectedBadgeIndex(undefined);
              }}
            ></Button>
          )}
          <Button size="small" variation="link" onClick={addItem}>
            {selectedBadgeIndex !== undefined ? "Save" : "Add"}
          </Button>
        </Flex>
      )}
      {arraySection}
    </React.Fragment>
  );
}
export default function OrdersCreateForm(props) {
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
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    orderNotes: "",
    status: "",
    line_items: [],
    quarantine: false,
    tags: "",
  };
  const [customerName, setCustomerName] = React.useState(
    initialValues.customerName
  );
  const [customerEmail, setCustomerEmail] = React.useState(
    initialValues.customerEmail
  );
  const [customerAddress, setCustomerAddress] = React.useState(
    initialValues.customerAddress
  );
  const [orderNotes, setOrderNotes] = React.useState(initialValues.orderNotes);
  const [status, setStatus] = React.useState(initialValues.status);
  const [line_items, setLine_items] = React.useState(initialValues.line_items);
  const [quarantine, setQuarantine] = React.useState(initialValues.quarantine);
  const [tags, setTags] = React.useState(initialValues.tags);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setCustomerName(initialValues.customerName);
    setCustomerEmail(initialValues.customerEmail);
    setCustomerAddress(initialValues.customerAddress);
    setOrderNotes(initialValues.orderNotes);
    setStatus(initialValues.status);
    setLine_items(initialValues.line_items);
    setCurrentLine_itemsValue("");
    setQuarantine(initialValues.quarantine);
    setTags(initialValues.tags);
    setErrors({});
  };
  const [currentLine_itemsValue, setCurrentLine_itemsValue] =
    React.useState("");
  const line_itemsRef = React.createRef();
  const validations = {
    customerName: [{ type: "Required" }],
    customerEmail: [{ type: "Required" }],
    customerAddress: [{ type: "Required" }],
    orderNotes: [],
    status: [{ type: "Required" }],
    line_items: [{ type: "Required" }],
    quarantine: [],
    tags: [],
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
          customerName,
          customerEmail,
          customerAddress,
          orderNotes,
          status,
          line_items,
          quarantine,
          tags,
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
          await DataStore.save(new Orders(modelFields));
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
      {...getOverrideProps(overrides, "OrdersCreateForm")}
      {...rest}
    >
      <TextField
        label="Customer name"
        isRequired={true}
        isReadOnly={false}
        value={customerName}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customerName: value,
              customerEmail,
              customerAddress,
              orderNotes,
              status,
              line_items,
              quarantine,
              tags,
            };
            const result = onChange(modelFields);
            value = result?.customerName ?? value;
          }
          if (errors.customerName?.hasError) {
            runValidationTasks("customerName", value);
          }
          setCustomerName(value);
        }}
        onBlur={() => runValidationTasks("customerName", customerName)}
        errorMessage={errors.customerName?.errorMessage}
        hasError={errors.customerName?.hasError}
        {...getOverrideProps(overrides, "customerName")}
      ></TextField>
      <TextField
        label="Customer email"
        isRequired={true}
        isReadOnly={false}
        value={customerEmail}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customerName,
              customerEmail: value,
              customerAddress,
              orderNotes,
              status,
              line_items,
              quarantine,
              tags,
            };
            const result = onChange(modelFields);
            value = result?.customerEmail ?? value;
          }
          if (errors.customerEmail?.hasError) {
            runValidationTasks("customerEmail", value);
          }
          setCustomerEmail(value);
        }}
        onBlur={() => runValidationTasks("customerEmail", customerEmail)}
        errorMessage={errors.customerEmail?.errorMessage}
        hasError={errors.customerEmail?.hasError}
        {...getOverrideProps(overrides, "customerEmail")}
      ></TextField>
      <TextField
        label="Customer address"
        isRequired={true}
        isReadOnly={false}
        value={customerAddress}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customerName,
              customerEmail,
              customerAddress: value,
              orderNotes,
              status,
              line_items,
              quarantine,
              tags,
            };
            const result = onChange(modelFields);
            value = result?.customerAddress ?? value;
          }
          if (errors.customerAddress?.hasError) {
            runValidationTasks("customerAddress", value);
          }
          setCustomerAddress(value);
        }}
        onBlur={() => runValidationTasks("customerAddress", customerAddress)}
        errorMessage={errors.customerAddress?.errorMessage}
        hasError={errors.customerAddress?.hasError}
        {...getOverrideProps(overrides, "customerAddress")}
      ></TextField>
      <TextField
        label="Order notes"
        isRequired={false}
        isReadOnly={false}
        value={orderNotes}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customerName,
              customerEmail,
              customerAddress,
              orderNotes: value,
              status,
              line_items,
              quarantine,
              tags,
            };
            const result = onChange(modelFields);
            value = result?.orderNotes ?? value;
          }
          if (errors.orderNotes?.hasError) {
            runValidationTasks("orderNotes", value);
          }
          setOrderNotes(value);
        }}
        onBlur={() => runValidationTasks("orderNotes", orderNotes)}
        errorMessage={errors.orderNotes?.errorMessage}
        hasError={errors.orderNotes?.hasError}
        {...getOverrideProps(overrides, "orderNotes")}
      ></TextField>
      <TextField
        label="Status"
        isRequired={true}
        isReadOnly={false}
        value={status}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customerName,
              customerEmail,
              customerAddress,
              orderNotes,
              status: value,
              line_items,
              quarantine,
              tags,
            };
            const result = onChange(modelFields);
            value = result?.status ?? value;
          }
          if (errors.status?.hasError) {
            runValidationTasks("status", value);
          }
          setStatus(value);
        }}
        onBlur={() => runValidationTasks("status", status)}
        errorMessage={errors.status?.errorMessage}
        hasError={errors.status?.hasError}
        {...getOverrideProps(overrides, "status")}
      ></TextField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              customerName,
              customerEmail,
              customerAddress,
              orderNotes,
              status,
              line_items: values,
              quarantine,
              tags,
            };
            const result = onChange(modelFields);
            values = result?.line_items ?? values;
          }
          setLine_items(values);
          setCurrentLine_itemsValue("");
        }}
        currentFieldValue={currentLine_itemsValue}
        label={"Line items"}
        items={line_items}
        hasError={errors?.line_items?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks("line_items", currentLine_itemsValue)
        }
        errorMessage={errors?.line_items?.errorMessage}
        setFieldValue={setCurrentLine_itemsValue}
        inputFieldRef={line_itemsRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Line items"
          isRequired={true}
          isReadOnly={false}
          value={currentLine_itemsValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.line_items?.hasError) {
              runValidationTasks("line_items", value);
            }
            setCurrentLine_itemsValue(value);
          }}
          onBlur={() =>
            runValidationTasks("line_items", currentLine_itemsValue)
          }
          errorMessage={errors.line_items?.errorMessage}
          hasError={errors.line_items?.hasError}
          ref={line_itemsRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "line_items")}
        ></TextField>
      </ArrayField>
      <SwitchField
        label="Quarantine"
        defaultChecked={false}
        isDisabled={false}
        isChecked={quarantine}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              customerName,
              customerEmail,
              customerAddress,
              orderNotes,
              status,
              line_items,
              quarantine: value,
              tags,
            };
            const result = onChange(modelFields);
            value = result?.quarantine ?? value;
          }
          if (errors.quarantine?.hasError) {
            runValidationTasks("quarantine", value);
          }
          setQuarantine(value);
        }}
        onBlur={() => runValidationTasks("quarantine", quarantine)}
        errorMessage={errors.quarantine?.errorMessage}
        hasError={errors.quarantine?.hasError}
        {...getOverrideProps(overrides, "quarantine")}
      ></SwitchField>
      <TextField
        label="Tags"
        isRequired={false}
        isReadOnly={false}
        value={tags}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customerName,
              customerEmail,
              customerAddress,
              orderNotes,
              status,
              line_items,
              quarantine,
              tags: value,
            };
            const result = onChange(modelFields);
            value = result?.tags ?? value;
          }
          if (errors.tags?.hasError) {
            runValidationTasks("tags", value);
          }
          setTags(value);
        }}
        onBlur={() => runValidationTasks("tags", tags)}
        errorMessage={errors.tags?.errorMessage}
        hasError={errors.tags?.hasError}
        {...getOverrideProps(overrides, "tags")}
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
