import { call, put, select, takeEvery } from 'redux-saga/effects';
import { CoreAPI } from 'react-kinetic-core';

import * as constants from '../../constants';
import { actions, types } from '../modules/submissions';
import { actions as systemErrorActions } from '../modules/systemError';

export function* fetchSubmissionsSaga({ payload: { coreState } }) {
  const kappSlug = yield select(state => state.app.config.kappSlug);
  const username = yield select(state => state.app.profile.username);
  const pageToken = yield select(state => state.services.submissions.current);
  const searchBuilder = new CoreAPI.SubmissionSearch()
    .type(constants.SUBMISSION_FORM_TYPE)
    .limit(constants.PAGE_SIZE)
    .includes([
      'details',
      'values',
      'form',
      'form.attributes',
      'form.kapp',
      'form.kapp.attributes',
      'form.kapp.space.attributes',
    ])
    .or()
    .eq(`values[${constants.REQUESTED_FOR_FIELD}]`, username)
    .eq('submittedBy', username)
    .end();
  // Add some of the optional parameters to the search
  if (coreState) searchBuilder.coreState(coreState);
  if (pageToken) searchBuilder.pageToken(pageToken);
  const search = searchBuilder.build();

  const { submissions, nextPageToken, serverError } = yield call(
    CoreAPI.searchSubmissions,
    { search, kapp: kappSlug },
  );

  if (serverError) {
    yield put(systemErrorActions.setSystemError(serverError));
  } else {
    yield put(
      pageToken && submissions.length === 0
        ? actions.fetchPreviousPage(coreState)
        : actions.setSubmissions(submissions, nextPageToken),
    );
  }
}

export function* watchSubmissions() {
  yield takeEvery(
    [
      types.FETCH_SUBMISSIONS,
      types.FETCH_NEXT_PAGE,
      types.FETCH_PREVIOUS_PAGE,
      types.FETCH_CURRENT_PAGE,
    ],
    fetchSubmissionsSaga,
  );
}
