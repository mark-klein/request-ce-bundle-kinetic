import { takeEvery, call, put } from 'redux-saga/effects';
import { CoreAPI } from 'react-kinetic-core';

import { types, actions } from '../modules/spaceForms';

export function* fetchFormsSaga(action) {
  const { forms, serverError } = yield call(CoreAPI.fetchForms, {
    kappSlug: action.payload,
    include: 'attributes',
  });

  if (serverError) {
    // TODO: implement system error push.
  } else {
    yield put(actions.setForms(forms));
  }
}

export function* watchForms() {
  yield takeEvery(types.FETCH_FORMS, fetchFormsSaga);
}
