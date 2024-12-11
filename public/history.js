var ocHistory = ocHistory || {};

// Apply filter based on the input value and update URL query parameters.
ocHistory.applyFilter = function() {
  const filterInput = document.getElementById('_filterInput');
  if (!filterInput) return;

  const filterText = filterInput.value;
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('filter', filterText);
  
  window.location.href = `${window.location.pathname}?${urlParams.toString()}`;
};

// Capitalize the first letter of a string.
ocHistory.capitalizeFirstLetter = function(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Update the status of a batch operation (e.g., cancel, submit) for selected jobs.
ocHistory.updateStatusBatch = function(action, jobIds) {
  if (!Array.isArray(jobIds) || jobIds.length === 0) return;

  const capitalizedAction = ocHistory.capitalizeFirstLetter(action);
  const button    = document.getElementById(`_history${capitalizedAction}Badge`);
  const count     = document.getElementById(`_history${capitalizedAction}Count`);
  const input     = document.getElementById(`_history${capitalizedAction}Input`);
  const modalBody = document.getElementById(`_history${capitalizedAction}Body`);

  input.value = jobIds.join(',');

  // Enable or disable the action button based on job selection.
  if (jobIds.length > 0) {
    button.classList.remove('disabled');
    button.disabled = false;
  }
  else {
    button.classList.add('disabled');
    button.disabled = true;
  }

  // Update the job count display.
  count.textContent = jobIds.length;

  // Update the modal content.
  const jobCountText = jobIds.length === 1 
    ? ` one selected ${action === 'cancel' ? 'job' : 'information'} (Job ID is ${jobIds[0]}) ?`
    : ` ${jobIds.length} selected ${action === 'cancel' ? 'jobs' : 'information'} ?`;

  modalBody.innerHTML = `Do you want to ${action}${jobCountText}`;

  // If more than one job is selected, display the list of job IDs.
  if (jobIds.length > 1) {
    const jobList = document.createElement('ul');
    jobIds.forEach(jobId => {
      const listItem = document.createElement('li');
      listItem.textContent = jobId;
      jobList.appendChild(listItem);
    });
    modalBody.appendChild(jobList);
  }
};

// Update the batch operations for checked rows (e.g., cancel, delete).
ocHistory.updateBatch = function(rows) {
  const countId = { checked: [], running: [] };

  rows.forEach(row => {
    const checkbox    = row.querySelector('td input[type="checkbox"]');
    const jobId       = row.getElementsByTagName('td')[1].textContent.trim();
    const statusIndex = row.getElementsByTagName('td').length - 1;
    const status      = row.getElementsByTagName('td')[statusIndex].textContent.trim();

    if (checkbox && checkbox.checked) {
      countId.checked.push(jobId);
      if (status === "Running" || status === "Queued") {
        countId.running.push(jobId);
      }
    }
  });

  // Update batch status for cancel and delete actions.
  ocHistory.updateStatusBatch("cancel", countId.running);
  ocHistory.updateStatusBatch("delete", countId.checked);
};

// Redirect to the current URL with the selected number of rows as a query parameter.
ocHistory.redirectWithRows = function() {
  const selectBox = document.getElementById("_historyRows");
  if (!selectBox) return;

  const selectedValue = selectBox.value;
  const currentUrl = window.location.href.split('?')[0]; // Get URL without query parameters.

  window.location.href = `${currentUrl}?rows=${selectedValue}`;
};

// Add event listeners to status radio buttons and update the URL when a selection changes.
document.querySelectorAll('input[name="_historyStatus"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('status', radio.value);
    url.searchParams.set('p', 1);
    window.location.href = url.toString();
  });
});

// Handle "Select All" checkbox functionality.
ocHistory.selectAllCheckbox = document.getElementById('_historySelectAll');
ocHistory.tbody = document.getElementById('_historyTbody');

if (ocHistory.selectAllCheckbox && ocHistory.tbody) {
  const rows = Array.from(ocHistory.tbody.getElementsByTagName('tr'));

  // Event listener for the "Select All" checkbox.
  ocHistory.selectAllCheckbox.addEventListener('change', function() {
    const isChecked = this.checked;
    rows.forEach(row => {
      const checkbox = row.querySelector('td input[type="checkbox"]');
      if (checkbox) checkbox.checked = isChecked;
    });
    ocHistory.updateBatch(rows);
  });

  // Event listener for individual row checkboxes.
  rows.forEach(row => {
    const checkbox = row.querySelector('td input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        ocHistory.updateBatch(rows);
      });
    }
  });
}
