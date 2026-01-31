/* eslint-disable @typescript-eslint/no-explicit-any */
function toPrettyObject(_: any, obj: any): any {
  if (obj._id) {
    obj.id = obj._id;
    delete obj._id;
  }
  return obj;
}

export const Utils = {
  toPrettyObject,
}