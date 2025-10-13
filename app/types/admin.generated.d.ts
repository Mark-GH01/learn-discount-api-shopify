/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type DiscountAutomaticAppCreateMutationVariables = AdminTypes.Exact<{
  automaticAppDiscount: AdminTypes.DiscountAutomaticAppInput;
}>;


export type DiscountAutomaticAppCreateMutation = { discountAutomaticAppCreate?: AdminTypes.Maybe<{ automaticAppDiscount?: AdminTypes.Maybe<Pick<AdminTypes.DiscountAutomaticApp, 'title' | 'startsAt'>>, userErrors: Array<Pick<AdminTypes.DiscountUserError, 'field' | 'message' | 'code'>> }> };

interface GeneratedQueryTypes {
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {\n    discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {\n      automaticAppDiscount {\n        title\n        startsAt\n      }\n      userErrors {\n        field\n        message\n        code\n      }\n    }\n  }": {return: DiscountAutomaticAppCreateMutation, variables: DiscountAutomaticAppCreateMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
