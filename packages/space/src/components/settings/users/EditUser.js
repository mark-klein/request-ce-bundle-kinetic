import React from 'react';
import { compose, lifecycle, withHandlers, withState } from 'recompose';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { fromJS } from 'immutable';
import { commonActions, PageTitle } from 'common';
import { actions as profileActions } from '../../../redux/modules/profiles';
import { actions as usersActions } from '../../../redux/modules/settingsUsers';
import { ProfileCard } from '../../shared/ProfileCard';
import { TeamCard } from '../../shared/TeamCard';
import { UsersDropdown } from './DropDown';

export const EditUserComponent = ({
  loading,
  user,
  users,
  error,
  fieldValues,
  location,
  locationEnabled,
  manager,
  managerEnabled,
  handleChangeManagerClick,
  handleFieldChange,
  handleSubmit,
  userProfileAttributes,
}) => (
  <div className="profile-container">
    <PageTitle parts={['Users', 'Settings']} />
    {!loading && (
      <div className="fragment">
        <div className="profile-content pane">
          <div className="page-title-wrapper">
            <div className="page-title">
              <h3>
                <Link to="/">home</Link> /{` `}
                <Link to="/settings">settings</Link> /{` `}
                <Link to={`/settings/users/`}>users</Link> /{` `}
              </h3>
              <h1>Edit: {user.displayName || user.username}</h1>
            </div>
          </div>
          <div>
            <h2 className="section-title">General</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group required">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  onChange={handleFieldChange}
                  value={fieldValues.displayName}
                />
              </div>
              <div className="form-group required">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  onChange={handleFieldChange}
                  value={fieldValues.email}
                />
              </div>
              <div>
                <h2 className="section-title">Profile Attributes</h2>
                <div className="user-attributes-wrapper">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      className="form-control"
                      value={fieldValues.firstName}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      className="form-control"
                      value={fieldValues.lastName}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      className="form-control"
                      value={fieldValues.phoneNumber}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h2 className="section-title">User Attributes</h2>
                <div className="user-attributes-wrapper">
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      id="department"
                      name="department"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="manager">Manager</label>
                    <UsersDropdown users={users} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="organization">Organization</label>
                    <input
                      id="organization"
                      name="organization"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="site">Site</label>
                    <input
                      id="site"
                      name="site"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h2 className="section-title">Roles</h2>

                <UserRoles
                  roles={user.memberships.filter(item =>
                    item.team.name.startsWith('Role::'),
                  )}
                />
              </div>
              <div>
                <h2 className="section-title">Teams</h2>
                <UserTeams
                  teams={user.memberships.filter(
                    item => !item.team.name.startsWith('Role::'),
                  )}
                />
              </div>
              <div className="footer-save">
                <button
                  disabled={!fieldValuesValid(fieldValues)}
                  className="btn btn-primary"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="profile-sidebar pane d-none d-sm-block">
          <ProfileCard
            user={buildProfile(fieldValues, user)}
            button={
              <Link to={`/settings/users/${user.username}`}>
                <button className="btn btn-primary btn-sm">View Profile</button>
              </Link>
            }
          />
        </div>
      </div>
    )}
  </div>
);

const UserTeams = ({ teams }) => (
  <div className="t-card-wrapper">
    {Object.keys(teams).length > 0 ? (
      teams.map(item => <TeamCard key={item.team.name} team={item.team} />)
    ) : (
      <p>No teams assigned</p>
    )}
  </div>
);

const UserRoles = ({ roles }) => (
  <div className="profile-roles-wrapper">
    {Object.keys(roles).length > 0 ? (
      roles.map(item => (
        <span className="profile-role" key={item.team.name}>
          {item.team.name.replace(/^Role::(.*?)/, '$1')}
        </span>
      ))
    ) : (
      <p>No roles assigned</p>
    )}
  </div>
);

const fieldValuesValid = fieldValues =>
  fieldValues.displayName &&
  fieldValues.email;

const getProfileAttribute = (user, attr) =>
  user.profileAttributes && user.profileAttributes[attr]
    ? user.profileAttributes[attr].join(', ')
    : '';

const buildProfile = (fieldValues, profile) => {
  const profileAttributes =
    profile && profile.profileAttributes
      ? fromJS(profile.profileAttributes).toJS()
      : {};
  if (fieldValues.phoneNumber !== '') {
    profileAttributes['Phone Number'] = [fieldValues.phoneNumber];
  }
  return {
    ...profile,
    displayName: fieldValues.displayName,
    email: fieldValues.email,
    profileAttributes: profileAttributes,
  };
};

const translateProfileToFieldValues = user => ({
  displayName: user.displayName || '',
  email: user.email || '',
  phoneNumber: getProfileAttribute(user, 'Phone Number'),
  firstName: getProfileAttribute(user, 'First Name'),
  lastName: getProfileAttribute(user, 'Last Name'),
});

const translateFieldValuesToProfile = (fieldValues, profile) => {
  const updatedProfile = buildProfile(fieldValues, profile);
  const result = {
    displayName: updatedProfile.displayName,
    email: updatedProfile.email,
    profileAttributes: updatedProfile.profileAttributes,
  };
  return result;
};

const openChangeManagerForm = ({ spaceAttributes, openForm }) => config => {
  openForm({
    kappSlug: spaceAttributes['Admin Kapp Slug'] || 'admin',
    formSlug:
      spaceAttributes['Change Manager Form Slug'] || 'manager-change-request',
    title: 'Change Manager',
    confirmationMessage: 'Your request has been submitted.',
  });
};

const mapStateToProps = state => ({
  loading: state.profiles.loading,
  user: state.profiles.profile,
  users: state.settingsUsers.users,
  error: state.profiles.error,
  location:
    state.profiles.profile &&
    state.profiles.profile.profileAttributes['Location'],
  locationEnabled: state.app.userProfileAttributeDefinitions['Location'],
  manager:
    state.profiles.profile && state.profiles.profile.attributes['Manager'],
  managerEnabled: state.app.userAttributeDefinitions['Manager'],
  spaceAttributes:
    state.kinops.space &&
    state.kinops.space.attributes.reduce((memo, item) => {
      memo[item.name] = item.value;
      return memo;
    }, {}),
});

const mapDispatchToProps = {
  fetchUsers: usersActions.fetchUsers,
  fetchProfile: profileActions.fetchProfile,
  updateProfile: profileActions.updateProfile,
  openForm: commonActions.openForm,
};

export const EditUser = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withState('fieldValues', 'setFieldValues', translateProfileToFieldValues({})),
  withHandlers({
    handleChangeManagerClick: openChangeManagerForm,
    handleFieldChange: props => ({ target: { name, value } }) => {
      name && props.setFieldValues({ ...props.fieldValues, [name]: value });
    },
    handleSubmit: props => event => {
      event.preventDefault();
      props.updateProfile(
        translateFieldValuesToProfile(props.fieldValues, props.user),
      );
    },
  }),
  lifecycle({
    componentWillMount() {
      this.props.fetchProfile(this.props.match.params.username);
      if(this.props.users.size <= 0) {
        this.props.fetchUsers()
      }
    },
    componentWillReceiveProps(nextProps) {
      if (this.props.user !== nextProps.user) {
        this.props.setFieldValues({
          ...this.props.fieldValues,
          ...translateProfileToFieldValues(nextProps.user),
        });
      }
    },
  }),
)(EditUserComponent);