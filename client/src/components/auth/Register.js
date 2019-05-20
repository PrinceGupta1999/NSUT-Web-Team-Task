import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import { withRouter } from "react-router-dom";
import { setErrors } from "../../actions/errorActions";
import { withStyles } from '@material-ui/core/styles';
import {
    Paper,
    Button,
    TextField,
    Grid
} from '@material-ui/core';

const styles = theme => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    button: {
        marginRight: theme.spacing.unit * 2
    }
});


class Register extends Component {
    constructor() {
        super();
        this.state = {
            name: "",
            email: "",
            password: "",
            password2: "",
            errors: {}
        };
    }

    componentDidMount() {
        // If logged in and user navigates to Login page, should redirect them to dashboard
        if (this.props.auth.isAuthenticated) {
            this.props.history.push('/dashboard');
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
            this.props.history.push('/dashboard');
        }
        this.setState({
            errors: nextProps.error.errors
        });
    }

    onChange = name => e => {
        if (Object.entries(this.state.errors).length !== 0) {
            this.props.setErrors({});
        }

        this.setState({ [name]: e.target.value });
    };

    onSubmit = e => {
        e.preventDefault();

        const newUser = {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password2: this.state.password2
        };

        this.props.registerUser(newUser);
    };

    render() {
        const { errors } = this.state;
        const { classes, isSelected } = this.props;
        return (
            <Paper className={classes.root} elevation={1}>
                <form noValidate onSubmit={this.onSubmit} autoComplete="off">
                    <TextField
                        fullWidth
                        required={isSelected}
                        error={errors.name !== undefined}
                        helperText={errors.name || "Enter your name"}
                        label="Name"
                        value={this.state.name}
                        onChange={this.onChange("name")}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        required={isSelected}
                        error={errors.email !== undefined}
                        helperText={errors.email || "Enter your email"}
                        label="Email"
                        value={this.state.email}
                        onChange={this.onChange("email")}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        required={isSelected}
                        type="password"
                        error={errors.password !== undefined}
                        helperText={errors.password || "Enter the password"}
                        label="Password"
                        value={this.state.password}
                        onChange={this.onChange("password")}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        required={isSelected}
                        type="password"
                        error={errors.password2 !== undefined || this.state.password !== this.state.password2}
                        helperText={errors.password2 || "Confirm password"}
                        label="Confirm Password"
                        value={this.state.password2}
                        onChange={this.onChange("password2")}
                        margin="normal"
                    />
                    <Grid container justify="flex-end">
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                        >Register
                        </Button>
                    </Grid>
                </form>
            </Paper>
        );
    }
}

Register.propTypes = {
    registerUser: PropTypes.func.isRequired,
    setErrors: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    error: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    error: state.error
});

export default connect(
    mapStateToProps,
    {
        registerUser,
        setErrors
    }
)(withStyles(styles)(withRouter(Register)));
