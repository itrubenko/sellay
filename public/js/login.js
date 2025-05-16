$(document).ready(function () {
    function populateFormErrors($form, formErrors) {
        Object.keys(formErrors).forEach(field => {
            let $el = $form.find(`[name=${field}]`);
            $el.after(`<div class="error-message" style='color:red'> ${formErrors[field]}</div>`)
        })
    }
    $('body').on('submit', '.register-form', async function (e) {
        e.preventDefault();
        const $registerForm = $(this);
        $registerForm.find('error-message, .js-global-error').empty();
        $.ajax({
            method: "POST",
            url: "users/register",
            data: $registerForm.serialize()
        })
        .done(function (result) {
            if (result.success) {
                window.location.assign('users/profile');
            } else {
                let fieldNames = Object.keys(result.formErrors);
                if (fieldNames.length) {
                    populateFormErrors($registerForm, result.formErrors);
                } else if (result.globalErrorMessage) {
                    $registerForm.find('.js-global-error').append(
                        `<div class="alert alert-warning" hidden role="alert">
                            ${result.globalErrorMessage}
                        </div>`
                    )
                }
            }
        })
        .fail(function() {
            console.log('Failed one');
        });
    });

    $('body').on('submit', '.login-form', async function (e) {
        e.preventDefault();
        const $loginForm = $(this);
        $loginForm.find('.error-message, .js-global-error').empty();
        $.ajax({
            method: "POST",
            url: "users/login",
            data: $loginForm.serialize()
        })
        .done(function (result) {
            if (result.success) {
                window.location.assign('users/profile');
            } else {
                let fieldNames = Object.keys(result.formErrors);
                if (fieldNames.length) {
                    populateFormErrors($loginForm, result.formErrors);
                } else if (result.globalErrorMessage) {
                    $loginForm.find('.js-global-error').append(
                        `<div class="alert alert-warning" role="alert">
                            ${result.globalErrorMessage}
                        </div>`
                    )
                }
            }
        })
        .fail(function() {
            console.log('Failed one');
        })
    });
});