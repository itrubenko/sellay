function checkLoginState() {
    FB.getLoginStatus(function (response) {
        if (response.authResponse) {
            console.log('Welcome!  Fetching your information.... ');
            FB.api('/me', {fields: 'name, email'}, function(response) {
                console.log(response);
                $.ajax({
                    method: "POST",
                    url: '/auth/facebook/login',
                    data: response
                })
                .done(result => {
                    if (result.success) {
                        window.location.assign(result.redirectURL);
                    }
                })
                .fail(err => {
                    console.log(err);
                });
        });
       } else {
            console.log('User cancelled login or did not fully authorize.'); }
    });
}

$(document).ready(function () {
    $('body').on('submit', '.register-form', async function (e) {
        e.preventDefault();
        const $registerForm = $(this);
        const url = $registerForm.attr('action');
        const data = $registerForm.serialize();
        $registerForm.find('.error-message, .js-global-error').empty();
        $.ajax({ method: "POST", url, data})
        .done(function (result) {
            if (result.success) {
                window.location.assign('/account');
            } else {
                let fieldNames = Object.keys(result.formErrors);
                if (fieldNames.length) {
                    populateFormErrors($registerForm, result.formErrors);
                } else if (result.globalErrorMessage) {
                    handleGlobalError($registerForm, '.js-global-error', result.globalErrorMessage);
                }
            }
        })
        .fail(function () {
            handleGlobalError($registerForm, '.js-global-error', err.statusText);
        });
    });

    $('body').on('submit', '.login-form', async function (e) {
        e.preventDefault();
        const $loginForm = $(this);
        const url = $loginForm.attr('action');
        const data = $loginForm.serialize();

        $loginForm.find('.error-message, .js-global-error').empty();
        $.ajax({ method: "POST", url, data})
            .done(function (result) {
                if (result.success) {
                    window.location.assign('/account');
                } else {
                    let fieldNames = Object.keys(result.formErrors);
                    if (fieldNames.length) {
                        populateFormErrors($loginForm, result.formErrors);
                    } else if (result.globalErrorMessage) {
                        handleGlobalError($loginForm, '.js-global-error', result.globalErrorMessage);
                    }
                }
            })
            .fail(function (err) {
                handleGlobalError($loginForm, '.js-global-error', err.statusText);
            })
    });
});