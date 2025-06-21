function handleGlobalError($container, errorContainer, message) {
    errorContainer = errorContainer || '.js-global-error';
    $container.find('.js-global-error').append(
        `<div class="alert alert-warning" role="alert">
            ${message}
        </div>`
    );
}

function populateFormErrors($form, formErrors) {
    Object.keys(formErrors).forEach(field => {
        let $el = $form.find(`[name=${field}]`);
        $el.after(`<div class="error-message" style='color:red'> ${formErrors[field]}</div>`)
    })
}
