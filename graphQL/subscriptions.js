/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateOrders = /* GraphQL */ `
  subscription OnCreateOrders($filter: ModelSubscriptionOrdersFilterInput) {
    onCreateOrders(filter: $filter) {
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
export const onUpdateOrders = /* GraphQL */ `
  subscription OnUpdateOrders($filter: ModelSubscriptionOrdersFilterInput) {
    onUpdateOrders(filter: $filter) {
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
export const onDeleteOrders = /* GraphQL */ `
  subscription OnDeleteOrders($filter: ModelSubscriptionOrdersFilterInput) {
    onDeleteOrders(filter: $filter) {
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
export const onCreateQBOtokens = /* GraphQL */ `
  subscription OnCreateQBOtokens(
    $filter: ModelSubscriptionQBOtokensFilterInput
  ) {
    onCreateQBOtokens(filter: $filter) {
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
export const onUpdateQBOtokens = /* GraphQL */ `
  subscription OnUpdateQBOtokens(
    $filter: ModelSubscriptionQBOtokensFilterInput
  ) {
    onUpdateQBOtokens(filter: $filter) {
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
export const onDeleteQBOtokens = /* GraphQL */ `
  subscription OnDeleteQBOtokens(
    $filter: ModelSubscriptionQBOtokensFilterInput
  ) {
    onDeleteQBOtokens(filter: $filter) {
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
export const onCreateProducts = /* GraphQL */ `
  subscription OnCreateProducts($filter: ModelSubscriptionProductsFilterInput) {
    onCreateProducts(filter: $filter) {
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
export const onUpdateProducts = /* GraphQL */ `
  subscription OnUpdateProducts($filter: ModelSubscriptionProductsFilterInput) {
    onUpdateProducts(filter: $filter) {
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
export const onDeleteProducts = /* GraphQL */ `
  subscription OnDeleteProducts($filter: ModelSubscriptionProductsFilterInput) {
    onDeleteProducts(filter: $filter) {
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
