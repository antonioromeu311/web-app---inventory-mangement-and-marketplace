/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createOrders = /* GraphQL */ `
  mutation CreateOrders(
    $input: CreateOrdersInput!
    $condition: ModelOrdersConditionInput
  ) {
    createOrders(input: $input, condition: $condition) {
      id
      customerName
      customerEmail
      customerAddress
      orderNotes
      status
      line_items
      quarantine
      tags
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateOrders = /* GraphQL */ `
  mutation UpdateOrders(
    $input: UpdateOrdersInput!
    $condition: ModelOrdersConditionInput
  ) {
    updateOrders(input: $input, condition: $condition) {
      id
      customerName
      customerEmail
      customerAddress
      orderNotes
      status
      line_items
      quarantine
      tags
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteOrders = /* GraphQL */ `
  mutation DeleteOrders(
    $input: DeleteOrdersInput!
    $condition: ModelOrdersConditionInput
  ) {
    deleteOrders(input: $input, condition: $condition) {
      id
      customerName
      customerEmail
      customerAddress
      orderNotes
      status
      line_items
      quarantine
      tags
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createQBOtokens = /* GraphQL */ `
  mutation CreateQBOtokens(
    $input: CreateQBOtokensInput!
    $condition: ModelQBOtokensConditionInput
  ) {
    createQBOtokens(input: $input, condition: $condition) {
      id
      accessToken
      realmID
      refreshToken
      nameQBO
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateQBOtokens = /* GraphQL */ `
  mutation UpdateQBOtokens(
    $input: UpdateQBOtokensInput!
    $condition: ModelQBOtokensConditionInput
  ) {
    updateQBOtokens(input: $input, condition: $condition) {
      id
      accessToken
      realmID
      refreshToken
      nameQBO
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteQBOtokens = /* GraphQL */ `
  mutation DeleteQBOtokens(
    $input: DeleteQBOtokensInput!
    $condition: ModelQBOtokensConditionInput
  ) {
    deleteQBOtokens(input: $input, condition: $condition) {
      id
      accessToken
      realmID
      refreshToken
      nameQBO
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const createProducts = /* GraphQL */ `
  mutation CreateProducts(
    $input: CreateProductsInput!
    $condition: ModelProductsConditionInput
  ) {
    createProducts(input: $input, condition: $condition) {
      id
      name
      description
      price
      classification
      amountOnHand
      amountCommit
      amountTotal
      systemTag
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const updateProducts = /* GraphQL */ `
  mutation UpdateProducts(
    $input: UpdateProductsInput!
    $condition: ModelProductsConditionInput
  ) {
    updateProducts(input: $input, condition: $condition) {
      id
      name
      description
      price
      classification
      amountOnHand
      amountCommit
      amountTotal
      systemTag
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const deleteProducts = /* GraphQL */ `
  mutation DeleteProducts(
    $input: DeleteProductsInput!
    $condition: ModelProductsConditionInput
  ) {
    deleteProducts(input: $input, condition: $condition) {
      id
      name
      description
      price
      classification
      amountOnHand
      amountCommit
      amountTotal
      systemTag
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
