import { isNull, isUndefined } from "lib/util/dataType";

export function isEmpty(value) {
    return isNull(value) || isUndefined(value) || value === "";
}
