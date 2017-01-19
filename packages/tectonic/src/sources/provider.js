// @flow

import type Model from '../model';
import type {
  ReturnType,
  ReturnsAllFields,
} from '../consts';

/**
 * Provider defines a single entity returned from an API response.
 *
 * If an API response returns more than one entity (ie. a post with embedded
 * comments), the source definition should use an object with many Provider
 * classes:
 *
 * returns: {
 *   post: Post.item(),
 *   comments: Post.comments.list()
 * }
 *
 */
export default class Provider {

  // Whether this will return an item, list, or nothing
  returnType: ReturnType
  // The model this returns
  model: Class<Model>
  // Whether this returns all fields or a subset of fields
  fields: ReturnsAllFields | Array<string>
  // Stores all field names as a key within an object.
  fieldsAsObject: { [key: string]: boolean } = {}

  constructor(model: Class<Model>, fields: ReturnsAllFields | Array<string>, returnType: ReturnType) {
    this.model = model;
    this.returnType = returnType;

    if (fields === '*') {
      this.fields = fields;
    } else {
      this.setFieldSubsets(fields, model);
    }
  }

  setFieldSubsets(fields: Array<string> | string, model: Class<Model>) {
    // If this only returns a single field we should wrap it in an array.
    if (typeof fields === 'string') {
      fields = [fields];
    }

    // And if this isn't an array already we've been passed a non-string and
    // non-array so throw an error.
    if (!Array.isArray(fields)) {
      throw new Error(`Unknown field type ${typeof fields}`);
    }

    model.assertFieldsExist(fields);

    // Store each field as the key to an object for O(1) lookups when testing
    // query field satisfiability
    fields.forEach((f) => { this.fieldsAsObject[f] = true; });

    // Finally set the fields that this source returns
    this.fields = fields;
  }

}
