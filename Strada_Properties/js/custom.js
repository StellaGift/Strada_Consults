(function () {

	'use strict'


	AOS.init({
		duration: 800,
		easing: 'slide',
		once: true
	});

	var preloader = function() {

		var loader = document.querySelector('.loader');
		var overlay = document.getElementById('overlayer');

		function fadeOut(el) {
			el.style.opacity = 1;
			(function fade() {
				if ((el.style.opacity -= .1) < 0) {
					el.style.display = "none";
				} else {
					requestAnimationFrame(fade);
				}
			})();
		};

		setTimeout(function() {
			fadeOut(loader);
			fadeOut(overlay);
		}, 200);
	};
	preloader();

	var themeStorageKey = 'strada-properties-theme';
	var rootElement = document.documentElement;

	var getStoredTheme = function() {
		try {
			return window.localStorage.getItem(themeStorageKey);
		} catch (error) {
			return null;
		}
	};

	var storeTheme = function(theme) {
		try {
			window.localStorage.setItem(themeStorageKey, theme);
		} catch (error) {}
	};

	var getPreferredTheme = function() {
		var storedTheme = getStoredTheme();

		if (storedTheme === 'dark' || storedTheme === 'light') {
			return storedTheme;
		}

		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark';
		}

		return 'light';
	};

	var applyTheme = function(theme) {
		var isDark = theme === 'dark';
		var toggles = document.querySelectorAll('.js-theme-toggle');

		rootElement.setAttribute('data-color-mode', theme);

		for (var i = 0; i < toggles.length; i++) {
			var label = toggles[i].querySelector('.theme-toggle-text');

			toggles[i].setAttribute('aria-pressed', isDark ? 'true' : 'false');
			toggles[i].setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

			if (label) {
				label.textContent = isDark ? 'Dark' : 'Light';
			}
		}
	};

	var setupThemeToggle = function() {
		var toggles = document.querySelectorAll('.js-theme-toggle');

		applyTheme(getPreferredTheme());

		for (var i = 0; i < toggles.length; i++) {
			toggles[i].addEventListener('click', function() {
				var currentTheme = rootElement.getAttribute('data-color-mode') === 'dark' ? 'dark' : 'light';
				var nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

				storeTheme(nextTheme);
				applyTheme(nextTheme);
			});
		}
	};

	setupThemeToggle();

	var setupFloatingWhatsApp = function() {
		if (document.querySelector('.floating-whatsapp-action')) {
			return;
		}

		var whatsappLink = document.createElement('a');
		whatsappLink.className = 'floating-whatsapp-action';
		whatsappLink.href = 'https://wa.me/2347038395145?text=Hello%20Strada%20Properties%20Limited%2C%20I%20would%20like%20to%20make%20an%20inquiry.';
		whatsappLink.target = '_blank';
		whatsappLink.rel = 'noopener';
		whatsappLink.setAttribute('aria-label', 'Chat with Strada Properties Limited on WhatsApp');
		whatsappLink.innerHTML = '<span class="floating-whatsapp-label">Chat With Us</span><span class="icon-whatsapp" aria-hidden="true"></span>';

		document.body.appendChild(whatsappLink);
	};

	setupFloatingWhatsApp();

	var setupContactForm = function() {
		var form = document.getElementById('contact-form');

		if (!form) {
			return;
		}

		var submitButton = form.querySelector('.js-contact-submit');
		var emailInput = form.querySelector('input[name="email"]');
		var fileInput = form.querySelector('.js-property-media');
		var mediaUrlsField = document.getElementById('media-upload-urls');
		var uploadProgressWrap = form.querySelector('.js-upload-progress-wrap');
		var uploadProgressBar = form.querySelector('.js-upload-progress-bar');
		var uploadProgressText = form.querySelector('.js-upload-progress-text');
		var uploadStatus = form.querySelector('.js-upload-status');
		var emailStatus = form.querySelector('.js-email-status');
		var contactStatus = form.querySelector('.js-contact-status');
		var uploadedMediaList = form.querySelector('.js-uploaded-media-list');
		var cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dxvxyv6qe/auto/upload';
		var cloudinaryUploadPreset = 'strada_properties_preset';
		var imageMaxBytes = 5 * 1024 * 1024;
		var videoMaxBytes = 50 * 1024 * 1024;
		var uploadState = {
			hasFiles: false,
			status: 'idle',
			uploads: []
		};

		if (submitButton) {
			submitButton.setAttribute('data-default-value', submitButton.value);
		}

		var setStatus = function(element, message, type) {
			if (!element) {
				return;
			}

			element.textContent = message || '';
			element.classList.remove('status-success', 'status-error', 'status-info');

			if (type) {
				element.classList.add('status-' + type);
			}
		};

		var validateEmailField = function(showMessage) {
			var emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
			var value;

			if (!emailInput) {
				return true;
			}

			value = emailInput.value.trim();

			if (!value) {
				emailInput.setCustomValidity('');
				setStatus(emailStatus, '', null);
				return false;
			}

			if (!emailPattern.test(value)) {
				emailInput.setCustomValidity('Please enter a complete email address, such as name@example.com.');

				if (showMessage) {
					setStatus(emailStatus, 'Please enter a complete email address, including the domain extension.', 'error');
				}

				return false;
			}

			emailInput.setCustomValidity('');
			setStatus(emailStatus, '', null);
			return true;
		};

		var setProgress = function(loadedBytes, totalBytes) {
			var percent = totalBytes ? Math.round((loadedBytes / totalBytes) * 100) : 0;

			percent = Math.max(0, Math.min(100, percent));

			if (uploadProgressWrap) {
				uploadProgressWrap.hidden = false;
			}

			if (uploadProgressBar) {
				uploadProgressBar.style.width = percent + '%';
			}

			if (uploadProgressText) {
				uploadProgressText.textContent = percent + '% uploaded';
			}
		};

		var resetUploadProgress = function() {
			if (uploadProgressWrap) {
				uploadProgressWrap.hidden = true;
			}

			if (uploadProgressBar) {
				uploadProgressBar.style.width = '0%';
			}

			if (uploadProgressText) {
				uploadProgressText.textContent = '0%';
			}
		};

		var areRequiredFieldsComplete = function() {
			var requiredFields = form.querySelectorAll('[required]');

			validateEmailField(false);

			for (var i = 0; i < requiredFields.length; i++) {
				if (!requiredFields[i].value.trim() || !requiredFields[i].checkValidity()) {
					return false;
				}
			}

			return true;
		};

		var updateSubmitState = function() {
			if (!submitButton) {
				return;
			}

			var uploadBlocksSubmit = uploadState.status === 'uploading' ||
				(uploadState.hasFiles && uploadState.status !== 'complete');

			submitButton.disabled = !areRequiredFieldsComplete() || uploadBlocksSubmit;
		};

		var validateFiles = function(files) {
			var imageCount = 0;
			var videoCount = 0;

			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				var fileType = (file.type || '').toLowerCase();
				var isImage = fileType.indexOf('image/') === 0;
				var isVideo = fileType.indexOf('video/') === 0;
				var isPdf = fileType === 'application/pdf' || /\.pdf$/i.test(file.name);

				if (!isImage && !isVideo && !isPdf) {
					return {
						valid: false,
						message: 'Please upload only images, videos, or PDF documents.'
					};
				}

				if (isImage) {
					imageCount += 1;

					if (file.size > imageMaxBytes) {
						return {
							valid: false,
							message: 'Each image must be 5MB or less.'
						};
					}
				}

				if (isVideo) {
					videoCount += 1;

					if (file.size > videoMaxBytes) {
						return {
							valid: false,
							message: 'Each video must be 50MB or less.'
						};
					}
				}
			}

			if (imageCount > 5) {
				return {
					valid: false,
					message: 'Please upload no more than 5 images at a time.'
				};
			}

			if (videoCount > 2) {
				return {
					valid: false,
					message: 'Please upload no more than 2 videos at a time.'
				};
			}

			return {
				valid: true,
				message: ''
			};
		};

		var uploadFileToCloudinary = function(file, onProgress) {
			return new Promise(function(resolve, reject) {
				var xhr = new XMLHttpRequest();
				var data = new FormData();

				data.append('file', file);
				data.append('upload_preset', cloudinaryUploadPreset);

				xhr.open('POST', cloudinaryUrl);

				xhr.upload.addEventListener('progress', function(event) {
					if (event.lengthComputable) {
						onProgress(event.loaded, event.total);
					} else {
						onProgress(event.loaded, file.size);
					}
				});

				xhr.onload = function() {
					var response;

					try {
						response = JSON.parse(xhr.responseText);
					} catch (error) {
						reject(new Error('The upload service returned an unreadable response.'));
						return;
					}

					if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
						resolve({
							fileName: file.name,
							secureUrl: response.secure_url,
							resourceType: response.resource_type || 'file'
						});
						return;
					}

					reject(new Error(response.error && response.error.message ? response.error.message : 'Upload failed.'));
				};

				xhr.onerror = function() {
					reject(new Error('Network error while uploading media.'));
				};

				xhr.send(data);
			});
		};

		var uploadFilesToCloudinary = function(files) {
			var totalBytes = 0;
			var completedBytes = 0;
			var uploadedItems = [];
			var i;

			for (i = 0; i < files.length; i++) {
				totalBytes += files[i].size;
			}

			var uploadNext = function(index) {
				if (index >= files.length) {
					return Promise.resolve(uploadedItems);
				}

				return uploadFileToCloudinary(files[index], function(loadedBytes) {
					setProgress(completedBytes + Math.min(loadedBytes, files[index].size), totalBytes);
				}).then(function(uploadedItem) {
					completedBytes += files[index].size;
					uploadedItems.push(uploadedItem);
					setProgress(completedBytes, totalBytes);
					return uploadNext(index + 1);
				});
			};

			return uploadNext(0);
		};

		var writeUploadedUrls = function(uploads) {
			if (!mediaUrlsField) {
				return;
			}

			mediaUrlsField.value = uploads.map(function(upload) {
				return upload.fileName + ' (' + upload.resourceType + '): ' + upload.secureUrl;
			}).join('\n');
		};

		var renderUploadedMediaList = function() {
			if (!uploadedMediaList) {
				return;
			}

			uploadedMediaList.innerHTML = '';

			if (!uploadState.uploads.length) {
				return;
			}

			for (var i = 0; i < uploadState.uploads.length; i++) {
				var item = document.createElement('div');
				var name = document.createElement('a');
				var removeButton = document.createElement('button');

				item.className = 'uploaded-media-item';

				name.className = 'uploaded-media-name';
				name.href = uploadState.uploads[i].secureUrl;
				name.target = '_blank';
				name.rel = 'noopener';
				name.textContent = uploadState.uploads[i].fileName;

				removeButton.type = 'button';
				removeButton.className = 'uploaded-media-remove js-remove-uploaded-media';
				removeButton.setAttribute('data-upload-index', i);
				removeButton.setAttribute('aria-label', 'Remove ' + uploadState.uploads[i].fileName);
				removeButton.innerHTML = '&times;';

				item.appendChild(name);
				item.appendChild(removeButton);
				uploadedMediaList.appendChild(item);
			}
		};

		var handleFileSelection = function() {
			var files = fileInput && fileInput.files ? Array.prototype.slice.call(fileInput.files) : [];
			var validation;

			uploadState.hasFiles = files.length > 0;
			uploadState.uploads = [];
			writeUploadedUrls([]);
			renderUploadedMediaList();
			setStatus(contactStatus, '', null);

			if (!files.length) {
				uploadState.status = 'idle';
				resetUploadProgress();
				setStatus(uploadStatus, '', null);
				updateSubmitState();
				return;
			}

			validation = validateFiles(files);

			if (!validation.valid) {
				uploadState.hasFiles = false;
				uploadState.status = 'idle';
				fileInput.value = '';
				resetUploadProgress();
				renderUploadedMediaList();
				setStatus(uploadStatus, validation.message, 'error');
				updateSubmitState();
				return;
			}

			uploadState.status = 'uploading';
			setProgress(0, 1);
			setStatus(uploadStatus, 'Preparing selected media for secure submission...', 'info');
			updateSubmitState();

			uploadFilesToCloudinary(files).then(function(uploads) {
				uploadState.status = 'complete';
				uploadState.uploads = uploads;
				writeUploadedUrls(uploads);
				renderUploadedMediaList();
				setProgress(1, 1);
				setStatus(uploadStatus, 'Media upload complete. Your files are ready to send.', 'success');
				updateSubmitState();
			}).catch(function(error) {
				uploadState.hasFiles = false;
				uploadState.status = 'idle';
				fileInput.value = '';
				writeUploadedUrls([]);
				renderUploadedMediaList();
				setStatus(uploadStatus, (error.message || 'Upload failed. Please try again.') + ' Files were not attached.', 'error');
				updateSubmitState();
			});
		};

		form.addEventListener('input', function() {
			validateEmailField(true);
			setStatus(contactStatus, '', null);
			updateSubmitState();
		});

		if (fileInput) {
			fileInput.addEventListener('change', handleFileSelection);
		}

		if (uploadedMediaList) {
			uploadedMediaList.addEventListener('click', function(event) {
				var eventTarget = event.target && event.target.nodeType === 1 ? event.target : event.target.parentElement;
				var removeButton = eventTarget ? eventTarget.closest('.js-remove-uploaded-media') : null;
				var uploadIndex;

				if (!removeButton) {
					return;
				}

				uploadIndex = parseInt(removeButton.getAttribute('data-upload-index'), 10);

				if (isNaN(uploadIndex) || !uploadState.uploads[uploadIndex]) {
					return;
				}

				uploadState.uploads.splice(uploadIndex, 1);
				writeUploadedUrls(uploadState.uploads);
				renderUploadedMediaList();

				if (!uploadState.uploads.length) {
					uploadState.hasFiles = false;
					uploadState.status = 'idle';
					fileInput.value = '';
					resetUploadProgress();
					setStatus(uploadStatus, 'Selected media removed. You can choose new files if needed.', 'info');
				} else {
					uploadState.hasFiles = true;
					uploadState.status = 'complete';
					setProgress(1, 1);
					setStatus(uploadStatus, 'Media attachment removed. Remaining files are ready to send.', 'success');
				}

				updateSubmitState();
			});
		}

		form.addEventListener('submit', function(event) {
			event.preventDefault();

			validateEmailField(true);

			if (!areRequiredFieldsComplete()) {
				form.classList.add('was-validated');
				setStatus(contactStatus, 'Please fill all required fields before sending.', 'error');
				updateSubmitState();
				return;
			}

			if (uploadState.status === 'uploading') {
				setStatus(contactStatus, 'Please wait until media upload is completed.', 'error');
				updateSubmitState();
				return;
			}

			if (uploadState.hasFiles && uploadState.status !== 'complete') {
				setStatus(contactStatus, 'Please complete or remove the selected media upload before sending.', 'error');
				updateSubmitState();
				return;
			}

			var submitDefaultValue = submitButton ? submitButton.getAttribute('data-default-value') : 'Send Message';
			var formData = new FormData(form);

			formData.delete('media_files');

			if (submitButton) {
				submitButton.disabled = true;
				submitButton.value = 'Sending...';
			}

			setStatus(contactStatus, 'Sending your message...', 'info');

			fetch(form.action, {
				method: 'POST',
				body: formData,
				headers: {
					Accept: 'application/json'
				}
			}).then(function(response) {
				if (response.ok) {
					return response;
				}

				return response.json().then(function(data) {
					var message = data && data.errors && data.errors.length ?
						data.errors.map(function(error) { return error.message; }).join(' ') :
						'Unable to send message. Please try again.';

					throw new Error(message);
				}).catch(function(error) {
					throw new Error(error.message || 'Unable to send message. Please try again.');
				});
			}).then(function() {
				form.reset();
				form.classList.remove('was-validated');
				uploadState.hasFiles = false;
				uploadState.status = 'idle';
				uploadState.uploads = [];
				writeUploadedUrls([]);
				renderUploadedMediaList();
				resetUploadProgress();
				setStatus(uploadStatus, '', null);
				setStatus(contactStatus, 'Message Sent Successfully', 'success');
			}).catch(function(error) {
				setStatus(contactStatus, error.message || 'Unable to send message. Please try again.', 'error');
			}).finally(function() {
				if (submitButton) {
					submitButton.value = submitDefaultValue;
				}

				updateSubmitState();
			});
		});

		updateSubmitState();
	};

	setupContactForm();

	var isPropertiesPage = window.location.pathname.toLowerCase().indexOf('properties.html') !== -1;

	var normalizeSearchText = function(value) {
		return (value || '')
			.toString()
			.toLowerCase()
			.replace(/[^\w\s/,-]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	};

	var configuredProperties = [
		{
			href: 'property-single-popular1.html',
			image: 'images/popular1-1.png',
			alt: 'Fully furnished 5 bedroom duplex at Majesty Estate, Port Harcourt',
			title: 'Fully Furnished 5 Bedroom Duplex with Swimming Pool and BQ',
			cardTitle: 'Fully Furnished 5 Bedroom Duplex',
			location: 'Majesty Estate, NTA Road, Port Harcourt',
			priceHtml: '&#8358;450m NET',
			specOneIcon: 'icon-bed',
			specOneText: '5 bedrooms',
			specTwoIcon: 'icon-bath',
			specTwoText: 'All ensuite',
			searchSuggestions: ['Majesty Estate', 'NTA Road', 'NTA', 'Port Harcourt', 'Swimming Pool', 'BQ']
		},
		{
			href: 'property-single-popular2.html',
			image: 'images/popular2-1.png',
			alt: 'Contemporary 4 bedroom duplex at Hilltop Estate, Owerri',
			title: 'Contemporary 4 Bedroom Duplex',
			cardTitle: 'Contemporary 4 Bedroom Duplex',
			location: 'Hilltop Estate, Owerri, Imo State',
			priceHtml: '&#8358;250m NET',
			specOneIcon: 'icon-bed',
			specOneText: '4 bedrooms',
			specTwoIcon: 'icon-bath',
			specTwoText: 'All ensuite',
			searchSuggestions: ['Hilltop Estate', 'Owerri', 'Imo State', 'Imo']
		},
		{
			href: 'property-single-popular3.html',
			image: 'images/popular3-1.png',
			alt: 'Luxury 4 bedroom duplex at Pearl Garden Estate, Port Harcourt',
			title: 'Luxury 4 Bedroom Duplex',
			cardTitle: 'Luxury 4 Bedroom Duplex',
			location: 'Pearl Garden Estate, Off Eliozu, Port Harcourt, High Executive Estate',
			priceHtml: '&#8358;350m NET',
			specOneIcon: 'icon-bed',
			specOneText: '4 bedrooms',
			specTwoIcon: 'icon-expand',
			specTwoText: '465 SQMs',
			searchSuggestions: ['Pearl Garden Estate', 'Eliozu', 'Off Eliozu', 'High Executive Estate', 'Port Harcourt']
		},
		{
			href: 'property-single-popular4.html',
			image: 'images/popular4-1.png',
			alt: 'Executive fully furnished 5 bedroom triplex at NAF Harmony Estate, Port Harcourt',
			title: 'Executive Fully Furnished 5 Bedroom Triplex',
			cardTitle: 'Executive Fully Furnished 5 Bedroom Triplex',
			location: 'NAF Harmony Estate, Off Eliozu, Port Harcourt',
			priceHtml: '&#8358;400m NET',
			specOneIcon: 'icon-bed',
			specOneText: '5 bedrooms',
			specTwoIcon: 'icon-check',
			specTwoText: 'Secure estate',
			searchSuggestions: ['NAF Harmony Estate', 'Eliozu', 'Off Eliozu', 'Port Harcourt', 'Military Security']
		},
		{
			href: 'property-single-popular5.html',
			image: 'images/popular5-1.png',
			alt: 'Exquisitely built 3 bedroom bungalow at NTA Road, Mgbuoba, Port Harcourt',
			title: 'Exquisitely Built 3 Bedroom Bungalow',
			cardTitle: 'Exquisitely Built 3 Bedroom Bungalow',
			location: 'NTA Road, Mgbuoba, Port Harcourt',
			priceHtml: '&#8358;90m NET',
			specOneIcon: 'icon-bed',
			specOneText: '3 bedrooms',
			specTwoIcon: 'icon-expand',
			specTwoText: '300 SQMs',
			searchSuggestions: ['NTA Road', 'NTA', 'Mgbuoba', 'Port Harcourt']
		},
		{
			href: 'property-single-popular6.html',
			image: 'images/popular6-1.png',
			alt: 'Stylish and modern contemporary 3 bedroom bungalow at Rumuodomaya, Port Harcourt',
			title: 'Stylish and Modern Contemporary 3 Bedroom Bungalow',
			cardTitle: 'Stylish and Modern Contemporary 3 Bedroom Bungalow',
			location: 'Rumuodomaya, Port Harcourt',
			priceHtml: '&#8358;85m NET',
			specOneIcon: 'icon-bed',
			specOneText: '3 bedrooms',
			specTwoIcon: 'icon-expand',
			specTwoText: '300 SQMs',
			searchSuggestions: ['Rumuodomaya', 'Port Harcourt']
		},
		{
			href: 'property-single-popular7.html',
			image: 'images/popular7-1.png',
			alt: 'Modern contemporary 4 bedroom bungalow at Rumuodomaya, Port Harcourt',
			title: 'Modern Contemporary 4 Bedroom Bungalow For Sale',
			cardTitle: 'Modern Contemporary 4 Bedroom Bungalow',
			location: 'Rumuodomaya, Port Harcourt',
			priceHtml: '&#8358;120m NET',
			specOneIcon: 'icon-bed',
			specOneText: '4 bedrooms',
			specTwoIcon: 'icon-expand',
			specTwoText: '400 SQMs',
			searchSuggestions: ['Rumuodomaya', 'Port Harcourt']
		},
		{
			href: 'property-single-popular8.html',
			image: 'images/popular8-1.png',
			alt: 'Modern 4 bedroom terrace duplexes at Ivory Height, Shell Cooperative Estate',
			title: 'Modern 4 Bedroom Terrace Duplexes',
			cardTitle: 'Modern 4 Bedroom Terrace Duplexes',
			location: 'Ivory Height, Shell Cooperative Estate, Eneka Link Road, Port Harcourt',
			priceHtml: '&#8358;200m per unit',
			specOneIcon: 'icon-bed',
			specOneText: '4 bedrooms',
			specTwoIcon: 'icon-check',
			specTwoText: 'Per unit',
			searchSuggestions: ['Ivory Height', 'Shell Cooperative Estate', 'Eneka Link Road', 'Eneka', 'Port Harcourt', 'PHC']
		},
		{
			href: 'property-single-popular9.html',
			image: 'images/popular9-1.png',
			alt: 'Executive 4 bedroom duplex at New Town Estate, Port Harcourt',
			title: 'Executive 4 Bedroom Duplex',
			cardTitle: 'Executive 4 Bedroom Duplex',
			location: 'New Town Estate, SarS Road, Port Harcourt',
			priceHtml: '&#8358;300m NET',
			specOneIcon: 'icon-bed',
			specOneText: '4 bedrooms',
			specTwoIcon: 'icon-expand',
			specTwoText: '470 SQMs',
			searchSuggestions: ['New Town Estate', 'SarS Road', 'Sars Road', 'Port Harcourt', 'Gatehouse']
		},
		{
			href: 'property-single-popular10.html',
			image: 'images/popular10-1.png',
			alt: 'Luxury furnished 5 bedroom duplex with swimming pool at Centenary Gardens Estate, Port Harcourt',
			title: 'Luxury Furnished 5 Bedroom Duplex With Swimming Pool',
			cardTitle: 'Luxury Furnished 5 Bedroom Duplex With Swimming Pool',
			location: 'Centenary Gardens Estate, Eliozu-Eneka Link Road, Port Harcourt',
			priceHtml: '&#8358;500m NET',
			specOneIcon: 'icon-bed',
			specOneText: '5 bedrooms',
			specTwoIcon: 'icon-check',
			specTwoText: 'Swimming pool',
			searchSuggestions: ['Centenary Gardens Estate', 'Eliozu-Eneka Link Road', 'Eliozu', 'Eneka', 'Port Harcourt', 'Swimming Pool']
		}
	];

	var allListingProperties = [
		{
			href: 'property-single-listing2.html',
			image: 'images/listing2-1.jpg',
			alt: 'Prime two and half plots of land at Choba, Port Harcourt',
			title: 'Very Prime 2 and 1/2 Plots of Land',
			cardTitle: 'Very Prime 2 and 1/2 Plots of Land',
			location: 'Choba, Port Harcourt',
			priceHtml: '&#8358;50m NET',
			specOneIcon: 'icon-expand',
			specOneText: '2.5 plots',
			specTwoIcon: 'icon-check',
			specTwoText: 'Residential or commercial',
			searchSuggestions: ['Choba', 'Port Harcourt', 'Dufill Foods Ltd', 'Indomie Company', 'Industrialized Area', 'Residential', 'Commercial']
		},
		{
			href: 'property-single-listing1.html',
			image: 'images/listing1-1.png',
			alt: 'Modern 4 bedroom detached duplex at Eliozu-Eneka Link Road, Port Harcourt',
			title: '4 Modern 4 Bedroom Detached Duplex',
			cardTitle: 'Modern 4 Bedroom Detached Duplex',
			location: 'Eliozu-Eneka Link Road, Port Harcourt',
			priceHtml: '&#8358;260m NET',
			specOneIcon: 'icon-bed',
			specOneText: '4 bedrooms',
			specTwoIcon: 'icon-bath',
			specTwoText: 'All ensuite',
			searchSuggestions: ['Eliozu-Eneka Link Road', 'Eliozu', 'Eneka', 'Port Harcourt', 'Secure Estate', 'Constant Power Supply']
		}
	].concat(configuredProperties);

	var buildPropertySearchValue = function(property) {
		var searchParts = [
			property.title,
			property.cardTitle,
			property.location,
			property.specOneText,
			property.specTwoText
		];

		if (property.searchSuggestions && property.searchSuggestions.length) {
			searchParts = searchParts.concat(property.searchSuggestions);
		}

		return normalizeSearchText(searchParts.join(' '));
	};

	var buildResponsiveCardImageHtml = function(src, alt) {
		var base = src.replace(/^images\/(.+)\.(png|jpe?g|webp)$/i, 'images/responsive/$1');
		var sizes = '(max-width: 575px) 100vw, (max-width: 991px) 50vw, 33vw';
		var avifSrcset = base + '-360.avif 360w, ' + base + '-540.avif 540w';
		var webpSrcset = base + '-360.webp 360w, ' + base + '-540.webp 540w';

		return [
			'<picture>',
			'  <source type="image/avif" srcset="' + avifSrcset + '" sizes="' + sizes + '">',
			'  <source type="image/webp" srcset="' + webpSrcset + '" sizes="' + sizes + '">',
			'  <img src="' + base + '-540.webp" alt="' + alt + '" class="img-fluid" srcset="' + webpSrcset + '" sizes="' + sizes + '" loading="lazy" decoding="async" />',
			'</picture>'
		].join('');
	};

	var buildPropertyCardHtml = function(property, index, extraClasses) {
		var propertyClasses = 'property-item';

		if (extraClasses) {
			propertyClasses += ' ' + extraClasses;
		}

		return [
			'<div class="' + propertyClasses + '" data-property-index="' + index + '" data-search="' + buildPropertySearchValue(property) + '">',
			'  <a href="' + property.href + '" class="img">',
			buildResponsiveCardImageHtml(property.image, property.alt),
			'  </a>',
			'  <div class="property-content">',
			'    <div class="price mb-2"><span>' + property.priceHtml + '</span></div>',
			'    <div>',
			'      <span class="d-block mb-2 text-black-50">' + property.cardTitle + '</span>',
			'      <span class="city d-block mb-3">' + property.location + '</span>',
			'      <div class="specs d-flex mb-4">',
			'        <span class="d-block d-flex align-items-center me-3">',
			'          <span class="' + property.specOneIcon + ' me-2"></span>',
			'          <span class="caption">' + property.specOneText + '</span>',
			'        </span>',
			'        <span class="d-block d-flex align-items-center">',
			'          <span class="' + property.specTwoIcon + ' me-2"></span>',
			'          <span class="caption">' + property.specTwoText + '</span>',
			'        </span>',
			'      </div>',
			'      <a href="' + property.href + '" class="btn btn-primary py-2 px-3">See details</a>',
			'    </div>',
			'  </div>',
			'</div>'
		].join('');
	};

	var renderConfiguredPropertySections = function() {
		var featuredSlider;
		var searchGrid;
		var sliderHtml = '';
		var gridHtml = '';
		var i;

		if (!isPropertiesPage) {
			return;
		}

		featuredSlider = document.querySelector('.property-slider-wrap .property-slider');
		searchGrid = document.getElementById('rivers-properties-grid');

		for (i = 0; i < configuredProperties.length; i++) {
			sliderHtml += buildPropertyCardHtml(configuredProperties[i], i, '');
		}

		for (i = 0; i < allListingProperties.length; i++) {
			gridHtml += '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-4">' +
				buildPropertyCardHtml(allListingProperties[i], i, 'mb-30') +
				'</div>';
		}

		if (featuredSlider) {
			featuredSlider.innerHTML = sliderHtml;
		}

		if (searchGrid) {
			searchGrid.innerHTML = gridHtml;
		}
	};

	renderConfiguredPropertySections();
	

	var tinySdlier = function() {

		var heroSlider = document.querySelectorAll('.hero-slide');
		var propertySlider = document.querySelectorAll('.property-slider');
		var imgPropertySlider = document.querySelectorAll('.img-property-slide');
		var testimonialSlider = document.querySelectorAll('.testimonial-slider');
		var restoreAutoplayOnControlsExit = function(sliderInstance, controlsSelector) {
			var controlsContainer = document.querySelector(controlsSelector);
			var controlButtons;
			var resumeAutoplay = function() {
				window.setTimeout(function() {
					if (!sliderInstance || typeof sliderInstance.play !== 'function') {
						return;
					}

					if (typeof sliderInstance.isOn === 'function' && !sliderInstance.isOn()) {
						return;
					}

					sliderInstance.play();
				}, 120);
			};

			if (!controlsContainer) {
				return;
			}

			controlButtons = controlsContainer.querySelectorAll('[data-controls]');

			for (var i = 0; i < controlButtons.length; i++) {
				controlButtons[i].addEventListener('mouseleave', resumeAutoplay);
				controlButtons[i].addEventListener('blur', resumeAutoplay);
				controlButtons[i].addEventListener('touchend', resumeAutoplay);
			}
		};
		

		if ( heroSlider.length > 0 ) {
			var tnsHeroSlider = tns({
				container: '.hero-slide',
				mode: 'carousel',
				speed: 700,
				autoplay: true,
				controls: false,
				nav: false,
				autoplayButtonOutput: false,
				controlsContainer: '#hero-nav',
			});
		}


		if ( imgPropertySlider.length > 0 ) {
			var tnsPropertyImageSlider = tns({
				container: '.img-property-slide',
				mode: 'carousel',
				speed: 700,
				items: 1,
				gutter: 30,
				autoplay: true,
				controls: false,
				nav: true,
				autoplayButtonOutput: false
			});
		}

		if ( propertySlider.length> 0 ) {
			var tnsSlider = tns({
				container: '.property-slider',
				mode: 'carousel',
				speed: 700,
				gutter: 30,
				items: 3,
				autoplay: true,
				autoplayButtonOutput: false,
				controlsContainer: '#property-nav',
				responsive: {
					0: {
						items: 1
					},
					700: {
						items: 2
					},
					900: {
						items: 3
					}
				}
			});

			restoreAutoplayOnControlsExit(tnsSlider, '#property-nav');
		}


		if ( testimonialSlider.length> 0 ) {
			var tnsSlider = tns({
				container: '.testimonial-slider',
				mode: 'carousel',
				speed: 700,
				items: 3,
				gutter: 50,
				autoplay: true,
				autoplayButtonOutput: false,
				controlsContainer: '#testimonial-nav',
				responsive: {
					0: {
						items: 1
					},
					700: {
						items: 2
					},
					900: {
						items: 3
					}
				}
			});
		}
	}
	tinySdlier();

	var riversLgas = [
		'Port Harcourt',
		'Obio-Akpor',
		'Eleme',
		'Ikwerre',
		'Etche',
		'Omuma',
		'Oyigbo',
		'Ahoada East',
		'Ahoada West',
		'Abua/Odual',
		'Akuku-Toru',
		'Andoni',
		'Asari-Toru',
		'Bonny',
		'Degema',
		'Emohua',
		'Gokana',
		'Khana',
		'Ogu/Bolo',
		'Opobo/Nkoro',
		'Tai'
	];

	var portHarcourtAreas = [
		'Old GRA',
		'GRA Phase 2',
		'D-Line',
		'Diobu',
		'Borokiri',
		'Mile 1',
		'Mile 3',
		'Rumuola',
		'Rumuokoro',
		'Rumuigbo',
		'Rumuodara',
		'Ada George',
		'Woji',
		'Elekahia',
		'Trans Amadi',
		'Choba',
		'Eliozu',
		'Eagle Island',
		'Peter Odili Road'
	];

	var riversPropertyLocations = [
		{
			address: '18 Azikiwe Road, Old GRA',
			area: 'Old GRA',
			lga: 'Port Harcourt',
			price: 'NGN 185,000,000'
		},
		{
			address: '42 Aba Road, D-Line',
			area: 'D-Line',
			lga: 'Port Harcourt',
			price: 'NGN 142,000,000'
		},
		{
			address: '12 Woji Road, Woji',
			area: 'Woji',
			lga: 'Obio-Akpor',
			price: 'NGN 127,000,000'
		},
		{
			address: '7 Ikwerre Road, Rumuokoro',
			area: 'Rumuokoro',
			lga: 'Obio-Akpor',
			price: 'NGN 118,000,000'
		},
		{
			address: '9 Nchia Road, Aleto',
			area: 'Aleto',
			lga: 'Eleme',
			price: 'NGN 96,000,000'
		},
		{
			address: '21 Isiokpo Main Road, Isiokpo',
			area: 'Isiokpo',
			lga: 'Ikwerre',
			price: 'NGN 88,000,000'
		},
		{
			address: '5 Omagwa Airport Road, Omagwa',
			area: 'Omagwa',
			lga: 'Ikwerre',
			price: 'NGN 102,000,000'
		},
		{
			address: '16 Afam Road, Afam',
			area: 'Afam',
			lga: 'Oyigbo',
			price: 'NGN 79,000,000'
		},
		{
			address: '3 East-West Link Road, Ahoada Town',
			area: 'Ahoada Town',
			lga: 'Ahoada East',
			price: 'NGN 83,000,000'
		}
	];

	var normalizeSearchText = function(value) {
		return (value || '')
			.toString()
			.toLowerCase()
			.replace(/[^\w\s/,-]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	};

	var uniqueValues = function(items) {
		var seen = {};
		var result = [];

		for (var i = 0; i < items.length; i++) {
			var item = (items[i] || '').trim();
			var key = item.toLowerCase();

			if (!item || seen[key]) {
				continue;
			}

			seen[key] = true;
			result.push(item);
		}

		return result;
	};

	var buildRiversSearchOptions = function() {
		var options = [];
		var i;
		var j;
		var property;
		var locationParts;

		for (i = 0; i < allListingProperties.length; i++) {
			property = allListingProperties[i];
			locationParts = property.location.split(',');

			options.push(property.location);

			for (j = 0; j < locationParts.length; j++) {
				options.push(locationParts[j].trim());
			}

			for (j = 0; j < property.searchSuggestions.length; j++) {
				options.push(property.searchSuggestions[j]);
			}
		}

		options.push('Port Harcourt');
		options.push('Owerri');
		options.push('Imo State');

		return uniqueValues(options).sort();
	};

	var populateRiversSearchDatalist = function() {
		var list = document.getElementById('rivers-locations-list');

		if (!list) {
			return;
		}

		var options = buildRiversSearchOptions();
		list.innerHTML = '';

		for (var i = 0; i < options.length; i++) {
			var option = document.createElement('option');
			option.value = options[i];
			list.appendChild(option);
		}
	};

	var applyRiversPropertyData = function() {
		var cards = document.querySelectorAll('.section-properties .property-item');
		var property;
		var propertyIndex;

		if (!cards.length) {
			return;
		}

		for (var i = 0; i < cards.length; i++) {
			propertyIndex = parseInt(cards[i].getAttribute('data-property-index'), 10);
			property = allListingProperties[isNaN(propertyIndex) ? i : propertyIndex];

			if (!property) {
				continue;
			}

			cards[i].setAttribute('data-search', buildPropertySearchValue(property));
		}
	};

	var getLocationQuery = function() {
		var params = new URLSearchParams(window.location.search);
		return (params.get('location') || params.get('area') || '').trim();
	};

	var updateLocationQueryInUrl = function(locationQuery) {
		var params = new URLSearchParams(window.location.search);

		if (locationQuery) {
			params.set('location', locationQuery);
		} else {
			params.delete('location');
		}

		var nextQueryString = params.toString();
		var nextUrl = window.location.pathname + (nextQueryString ? '?' + nextQueryString : '');
		window.history.replaceState({}, '', nextUrl);
	};

	var syncSearchInputs = function(value) {
		var inputs = document.querySelectorAll('.js-rivers-search-input');

		for (var i = 0; i < inputs.length; i++) {
			inputs[i].value = value;
		}
	};

	var updateSearchFeedback = function(rawQuery, visibleCount, totalCount) {
		var feedbackEl = document.getElementById('rivers-search-feedback');
		var trimmedQuery = (rawQuery || '').trim();

		if (!feedbackEl) {
			return;
		}

		if (!trimmedQuery) {
			feedbackEl.textContent = 'Showing all ' + totalCount + ' listed properties.';
			return;
		}

		if (visibleCount === 0) {
			feedbackEl.textContent = 'No listed property found for "' + trimmedQuery + '". Try another area, estate, or city.';
			return;
		}

		feedbackEl.textContent = 'Showing ' + visibleCount + ' of ' + totalCount + ' listed properties for "' + trimmedQuery + '".';
	};

	var filterProperties = function(rawQuery) {
		var cards = document.querySelectorAll('.section-properties .property-item');
		var query = normalizeSearchText(rawQuery);
		var total = cards.length;
		var visible = 0;

		if (!cards.length) {
			return;
		}

		for (var i = 0; i < cards.length; i++) {
			var card = cards[i];
			var searchValue = normalizeSearchText(card.getAttribute('data-search') || card.textContent);
			var isMatch = !query || searchValue.indexOf(query) !== -1;
			var cardWrapper = card.closest('.col-xs-12, .col-sm-6, .col-md-6, .col-lg-4') || card;

			cardWrapper.style.display = isMatch ? '' : 'none';

			if (isMatch) {
				visible += 1;
			}
		}

		updateSearchFeedback(rawQuery, visible, total);
	};

	var setupRiversSearchForms = function() {
		var forms = document.querySelectorAll('.js-rivers-search-form');

		if (!forms.length) {
			return;
		}

		for (var i = 0; i < forms.length; i++) {
			forms[i].addEventListener('submit', function(event) {
				event.preventDefault();

				var input = this.querySelector('.js-rivers-search-input');
				var query = input ? input.value.trim() : '';
				var action = this.getAttribute('action') || 'properties.html';

				if (isPropertiesPage) {
					updateLocationQueryInUrl(query);
					syncSearchInputs(query);
					filterProperties(query);
					return;
				}

				window.location.href = action + (query ? '?location=' + encodeURIComponent(query) : '') + '#listed-properties';
			});
		}
	};

	var getVideoPreferenceState = function() {
		var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
		var shouldSaveData = connection && (connection.saveData || /2g/.test(connection.effectiveType || ''));

		return {
			prefersReducedMotion: prefersReducedMotion,
			shouldSaveData: shouldSaveData
		};
	};

	var loadDeferredVideo = function(video) {
		if (video.getAttribute('data-loaded') === 'true') {
			return true;
		}

		var hasSource = !!(video.getAttribute('src') || video.querySelector('source[src]'));
		var sourceList = [
			{ src: video.getAttribute('data-src'), type: video.getAttribute('data-type') || 'video/mp4' },
			{ src: video.getAttribute('data-src-mp4'), type: video.getAttribute('data-type-mp4') || 'video/mp4' },
			{ src: video.getAttribute('data-src-webm'), type: video.getAttribute('data-type-webm') || 'video/webm' }
		];

		for (var i = 0; i < sourceList.length; i++) {
			if (!sourceList[i].src || hasSource) {
				continue;
			}

			var source = document.createElement('source');
			source.src = sourceList[i].src;
			source.type = sourceList[i].type;
			video.appendChild(source);
			hasSource = true;
		}

		if (!hasSource) {
			return false;
		}

		video.defaultMuted = true;
		video.muted = true;
		video.playsInline = true;
		video.setAttribute('muted', '');
		video.setAttribute('playsinline', '');
		video.setAttribute('webkit-playsinline', '');
		video.preload = video.classList.contains('js-hero-video') ? 'auto' : 'metadata';
		video.setAttribute('data-loaded', 'true');
		video.load();

		return true;
	};

	var playDeferredVideo = function(video) {
		if (document.hidden) {
			return;
		}

		var playPromise = video.play();
		if (playPromise && playPromise.catch) {
			playPromise.catch(function() {});
		}
	};

	var setupHeroVideo = function() {
		var video = document.querySelector('.js-hero-video');

		if (!video) {
			return;
		}

		var isNearViewport = true;

		video.defaultMuted = true;
		video.muted = true;
		video.playsInline = true;
		video.autoplay = true;
		video.setAttribute('muted', '');
		video.setAttribute('playsinline', '');
		video.setAttribute('webkit-playsinline', '');

		var handleHeroLoaded = function() {
			video.classList.add('is-loaded');
			if (isNearViewport) {
				playDeferredVideo(video);
			}
		};

		var loadHeroVideo = function() {
			if (video.getAttribute('data-loaded') === 'true') {
				if (video.readyState >= 2) {
					handleHeroLoaded();
				} else if (isNearViewport) {
					playDeferredVideo(video);
				}
				return;
			}

			video.addEventListener('loadeddata', handleHeroLoaded, { once: true });
			video.addEventListener('canplay', handleHeroLoaded, { once: true });
			video.addEventListener('playing', handleHeroLoaded, { once: true });

			if (!loadDeferredVideo(video)) {
				return;
			}

			if (video.readyState >= 2) {
				handleHeroLoaded();
			} else if (isNearViewport) {
				playDeferredVideo(video);
			}
		};

		loadHeroVideo();

		if ('IntersectionObserver' in window) {
			var observer = new IntersectionObserver(function(entries) {
				for (var i = 0; i < entries.length; i++) {
					if (entries[i].isIntersecting) {
						isNearViewport = true;
						if (video.getAttribute('data-loaded') === 'true') {
							playDeferredVideo(video);
						} else {
							loadHeroVideo();
						}
						break;
					}

					isNearViewport = false;
					video.pause();
				}
			}, { rootMargin: '240px 0px' });

			observer.observe(video);
		} else {
			isNearViewport = true;
			loadHeroVideo();
		}

		document.addEventListener('visibilitychange', function() {
			if (document.hidden) {
				video.pause();
			} else if (isNearViewport && video.getAttribute('data-loaded') === 'true') {
				playDeferredVideo(video);
			}
		});

		var retryHeroPlayback = function() {
			if (isNearViewport && video.getAttribute('data-loaded') === 'true' && video.paused) {
				playDeferredVideo(video);
			}
		};

		document.addEventListener('touchstart', retryHeroPlayback, { passive: true });
		document.addEventListener('click', retryHeroPlayback);
	};

	var setupInteractionVideos = function() {
		var videos = document.querySelectorAll('.js-lazy-video');

		if (!videos.length) {
			return;
		}

		var preferences = getVideoPreferenceState();
		var allowPassiveInteraction = !preferences.prefersReducedMotion && !preferences.shouldSaveData;

		for (var i = 0; i < videos.length; i++) {
			(function(video) {
				var shell = video.closest ? video.closest('.callout-media') : video.parentNode;
				var toggle = shell ? shell.querySelector('.js-callout-video-toggle') : null;
				var isNearViewport = !('IntersectionObserver' in window);
				var wantsPlay = false;

				var updatePlayingState = function() {
					var isPlaying = !video.paused && !video.ended;

					if (shell) {
						shell.classList.toggle('is-playing', isPlaying);
					}

					if (toggle) {
						toggle.setAttribute('aria-label', isPlaying ? 'Pause featured home video' : 'Play featured home video');
					}
				};

				var pauseVideo = function(resetIntent) {
					if (resetIntent) {
						wantsPlay = false;
					}

					video.pause();
					updatePlayingState();
				};

				var requestPlay = function() {
					wantsPlay = true;

					if (!isNearViewport) {
						loadDeferredVideo(video);
						return;
					}

					if (loadDeferredVideo(video)) {
						playDeferredVideo(video);
					}
				};

				video.addEventListener('loadeddata', function() {
					video.classList.add('is-loaded');
				});
				video.addEventListener('play', updatePlayingState);
				video.addEventListener('pause', updatePlayingState);

				if (toggle) {
					toggle.addEventListener('click', function(event) {
						event.preventDefault();

						if (!video.paused) {
							pauseVideo(true);
							return;
						}

						requestPlay();
					});
				}

				video.addEventListener('click', function() {
					if (!video.paused) {
						pauseVideo(true);
						return;
					}

					requestPlay();
				});

				if (allowPassiveInteraction && shell) {
					shell.addEventListener('focusin', function() {
						window.setTimeout(function() {
							if (shell && shell.contains(document.activeElement) && video.paused) {
								requestPlay();
							}
						}, 140);
					});

					shell.addEventListener('focusout', function() {
						window.setTimeout(function() {
							if (shell && !shell.contains(document.activeElement)) {
								pauseVideo(true);
							}
						}, 0);
					});
				}

				if ('IntersectionObserver' in window) {
					var observer = new IntersectionObserver(function(entries) {
						for (var j = 0; j < entries.length; j++) {
							if (entries[j].isIntersecting) {
								isNearViewport = true;

								if (!preferences.shouldSaveData) {
									loadDeferredVideo(video);
								}

								if (wantsPlay) {
									requestPlay();
								}

								continue;
							}

							isNearViewport = false;
							pauseVideo(false);
						}
					}, { rootMargin: '360px 0px', threshold: 0.12 });

					observer.observe(video);
				}

				document.addEventListener('visibilitychange', function() {
					if (document.hidden) {
						pauseVideo(false);
					} else if (wantsPlay && isNearViewport) {
						requestPlay();
					}
				});

				window.addEventListener('blur', function() {
					pauseVideo(false);
				});

				window.addEventListener('focus', function() {
					if (wantsPlay && isNearViewport) {
						requestPlay();
					}
				});
			})(videos[i]);
		}
	};

	populateRiversSearchDatalist();
	applyRiversPropertyData();
	setupRiversSearchForms();
	setupHeroVideo();
	setupInteractionVideos();
	syncSearchInputs(getLocationQuery());
	filterProperties(getLocationQuery());


})()


