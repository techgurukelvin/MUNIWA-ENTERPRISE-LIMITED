// Sends any <form data-wa-form> to WhatsApp as a prefilled message.
// data-wa-title sets the message heading; an element with [data-wa-preview] shows the message live.
(function () {
    var WA_NUMBER = '254104944012';

    function labelFor(form, field) {
        var label = form.querySelector('label[for="' + field.id + '"]');
        if (!label) {
            var group = field.closest('[data-label]');
            return group ? group.dataset.label : field.name;
        }
        return label.textContent.replace(/\*/g, '').replace(/\(.*?\)/g, '').trim();
    }

    function buildMessage(form) {
        var lines = ['*' + (form.dataset.waTitle || 'Website Enquiry') + '*'];
        var grouped = {};

        form.querySelectorAll('input, select, textarea').forEach(function (field) {
            if (field.type === 'submit' || field.type === 'button') return;
            if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) return;
            var value = (field.value || '').trim();
            if (!value) return;

            if (field.type === 'checkbox') {
                var key = labelFor(form, field);
                (grouped[key] = grouped[key] || []).push(value);
            } else {
                lines.push(labelFor(form, field) + ': ' + value);
            }
        });

        Object.keys(grouped).forEach(function (key) {
            lines.push(key + ': ' + grouped[key].join(', '));
        });
        return lines.join('\n');
    }

    document.querySelectorAll('form[data-wa-form]').forEach(function (form) {
        var preview = document.querySelector('[data-wa-preview]');
        function updatePreview() { if (preview) preview.textContent = buildMessage(form); }
        form.addEventListener('input', updatePreview);
        form.addEventListener('change', updatePreview);
        updatePreview();

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(buildMessage(form));
            window.open(url, '_blank', 'noopener');

            var msg = form.querySelector('.form-success');
            if (msg) {
                msg.style.display = 'block';
                msg.classList.remove('hidden');
                setTimeout(function () { msg.style.display = 'none'; }, 8000);
            }
        });
    });
})();
