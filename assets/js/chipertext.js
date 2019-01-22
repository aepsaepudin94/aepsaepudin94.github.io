var regex = /^[a-zA-Z]*$/;
var chipertextModule = {
	abjad: () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
	init: (func, subFunc = 'generate') => { chipertextModule[func][subFunc]() },
	monoAlfabet: {
		generate: function () {
			var _self = chipertextModule;
			var plaintext = document.getElementById('plaintext-val').value.replace(/\s/g,'').toUpperCase();
			var moveVal = document.getElementById('move-val').value;
			var isNotExpectText = !regex.test(plaintext);
			var isOverMoveVal = moveVal < 1 || moveVal > 25;
			var isNotValid = moveVal == '' || plaintext == '' || isNotExpectText || isOverMoveVal;
			var textAlert = 'Tidak boleh kosong.';

			if (isNotExpectText) {
				textAlert = 'Hanya boleh huruf.';
			} else if (isOverMoveVal) {
				textAlert = 'Masukan nilai geser dari 1 sampai 25.';
			}

			if (isNotValid) {
				alert(textAlert);
				return false;
			}

			document.getElementById('result-monoalfabet').style.display = 'block';

			var oriAbjadTable = document.querySelector('#result-monoalfabet .original-abjad');
			var tbodyAbjad = document.createElement('tbody');
			var trText = document.createElement('tr');
			var trIndex = document.createElement('tr');

			oriAbjadTable.innerHTML = '';
			var arrAbjad = _self.abjad();
			for (var i = 0; i < arrAbjad.length; i++) {
				var tdText = document.createElement('td');
						tdText.innerHTML = arrAbjad[i];
				var tdIndex = document.createElement('td');
						tdIndex.innerHTML = i;
				trText.appendChild(tdText);
				trIndex.appendChild(tdIndex);
			}
			tbodyAbjad.appendChild(trText);
			tbodyAbjad.appendChild(trIndex);
			oriAbjadTable.appendChild(tbodyAbjad);

			var resAbjadTable = document.getElementById('result-abjad');
			var tbodyAbjadRes = document.createElement('tbody');
			var trTextRes = document.createElement('tr');
			var trIndexRes = document.createElement('tr');

			resAbjadTable.innerHTML = '';
			var resultAbjadArr = [];
			for (var i = 0; i < arrAbjad.length; i++) {
				let idx = (i + parseInt(moveVal)) > 25 ? (i + parseInt(moveVal)) - 26 : (i + parseInt(moveVal));

				var tdTextRes = document.createElement('td');
						tdTextRes.innerHTML = arrAbjad[idx];
				var tdIndexRes = document.createElement('td');
						tdIndexRes.innerHTML = i;
				trTextRes.appendChild(tdTextRes);
				trIndexRes.appendChild(tdIndexRes);

				resultAbjadArr.push(arrAbjad[idx]);
			}
			tbodyAbjadRes.appendChild(trTextRes);
			tbodyAbjadRes.appendChild(trIndexRes);
			resAbjadTable.appendChild(tbodyAbjadRes);

			var chipertextResultMono = plaintext.replace(/\s/g,'').split('').map(a => resultAbjadArr[arrAbjad.indexOf(a)]);
			var chipertextResultMonoElem = document.getElementById('chipertext-result-mono');
			var plaintextResultMonoElem = document.getElementById('plaintext-result-mono');

			var tdLabelChp = document.createElement('td');
				tdLabelChp.innerHTML = 'Chipertext:';
			var tdLabelPlt = document.createElement('td');
				tdLabelPlt.innerHTML = 'Plaintext:';

			chipertextResultMonoElem.innerHTML = '';
			chipertextResultMonoElem.appendChild(tdLabelChp);
			plaintextResultMonoElem.innerHTML = '';
			plaintextResultMonoElem.appendChild(tdLabelPlt);

			chipertextResultMono.forEach(val => {
				var td = document.createElement('td');
					td.innerHTML = val;
				chipertextResultMonoElem.appendChild(td);
			});
			plaintext.replace(/\s/g,'').split('').forEach(val => {
				var td = document.createElement('td');
					td.innerHTML = val;
				plaintextResultMonoElem.appendChild(td);
			});
		},
		reset: function () {
			document.getElementById('result-monoalfabet').style.display = 'none';
			document.getElementById('move-val').value = '';
			document.getElementById('plaintext-val').value = '';
		}
	},
	polyAlfabet: {
		generate: function () {
			var _self = chipertextModule;
			var plaintext = document.getElementById('plaintext-val').value.replace(/\s/g,'').toUpperCase();
			var isNotExpectText = !regex.test(plaintext);
			var emptyKey = false;
			var isNotValidKey = false;
			var alertText = 'Tidak boleh kosong';

			document.querySelectorAll('#keys-poly .key').forEach((e) => {
				var valKey = e.querySelector('input[type=text]').value;
				if (valKey == '') {
					emptyKey = true;
					return false;
				}
				if (!regex.test(valKey)) {
					isNotValidKey = true;
					return false;
				}
				return true;
			});

			if (isNotExpectText) {
				alertText = 'Hanya boleh huruf.'
			} else if (isNotValidKey) {
				alertText = 'Masukan kunci dengan huruf';
			}

			var isEmpty = plaintext == '' || isNotExpectText || emptyKey || isNotValidKey;
			if (isEmpty) {
				alert(alertText);
				return false;
			}

			document.getElementById('result-polyalfabet').style.display = 'block';

			var keys = [];
			var arrAbjad = _self.abjad();
			var createKeyTable = function () {
				var tableKeysTarget = document.getElementById('keys-table');
				tableKeysTarget.innerHTML = '';
				keys.forEach((key, idx) => {
					var divKey = document.createElement('div');
						divKey.className = 'key-table';
					var labelKey = document.createElement('label');
						labelKey.innerHTML = 'Kunci ' + (idx + 1);
					var tableKey = document.createElement('table');
					var tbodyKey = document.createElement('tbody');
					var trAbjad = document.createElement('tr');
					var trKey = document.createElement('tr');

					key.forEach((keyItem, itemIndex) => {
						var tdAbjad = document.createElement('td');
							tdAbjad.innerHTML = keyItem;
						var tdKey = document.createElement('td');
							tdKey.innerHTML = arrAbjad[itemIndex];
						trAbjad.appendChild(tdAbjad);
						trKey.appendChild(tdKey);
					});
					tbodyKey.appendChild(trKey);
					tbodyKey.appendChild(trAbjad);
					tableKey.appendChild(tbodyKey);

					divKey.appendChild(labelKey);
					divKey.appendChild(tableKey);
					tableKeysTarget.appendChild(divKey);
				});
			}
			var keysElem = document.querySelectorAll('#keys-poly .key');
			keysElem.forEach(elem => {
				var key = [];
				var keyVal = elem.querySelector('input[type=text]').value.replace(/\s/g,'').toUpperCase().split('');
				keyVal.forEach(val => {
					var availableVal = key.indexOf(val) >= 0;
					if (availableVal) { return }
					key.push(val);
				});
				arrAbjad.forEach(ab => {
					var available = key.indexOf(ab) >= 0;
					if (available) { return }
					key.push(ab);
				});
				keys.push(key);
			});
			createKeyTable();
			var chipertextResultPoly = plaintext.split('').map((a) => {
				var idxAbjad = arrAbjad.indexOf(a);
				var resultChar = '';
				for (let i = 0; i < keys.length; i++) {
					var key = keys[i];
					var idx = idxAbjad;

					if (i > 0) { idx = arrAbjad.indexOf(resultChar); }

					var char = key[idx];
					resultChar = char;
				}
				return resultChar;
			});

			var chipertextResultPolyElem = document.getElementById('chipertext-result-poly');
			var plaintextResultPolyElem = document.getElementById('plaintext-result-poly');

			var tdLabelChp = document.createElement('td');
				tdLabelChp.innerHTML = 'Chipertext:';
			var tdLabelPlt = document.createElement('td');
				tdLabelPlt.innerHTML = 'Plaintext:';

			chipertextResultPolyElem.innerHTML = '';
			chipertextResultPolyElem.appendChild(tdLabelChp);
			plaintextResultPolyElem.innerHTML = '';
			plaintextResultPolyElem.appendChild(tdLabelPlt);

			chipertextResultPoly.forEach(val => {
				var td = document.createElement('td');
					td.innerHTML = val;
				chipertextResultPolyElem.appendChild(td);
			});
			plaintext.replace(/\s/g,'').split('').forEach(val => {
				var td = document.createElement('td');
					td.innerHTML = val;
				plaintextResultPolyElem.appendChild(td);
			});
		},
		reset: function () {
			document.getElementById('result-polyalfabet').style.display = 'none';
			document.getElementById('plaintext-val').value = '';
			document.querySelectorAll('#keys-poly .key').forEach((keyElem, i) => {
				if (i > 0) {
					document.getElementById('keys-poly').removeChild(keyElem)
				} else {
					keyElem.querySelector('input[type=text]').value = '';
				}
			});
		},
		addKey: function () {
			var targetElem = document.getElementById('keys-poly');
			var divKey = document.createElement('div');
					divKey.className = 'key';
			var newKeyLabel = document.createElement('label');
					newKeyLabel.className = 'label-key';
			var newKey = document.createElement('input');
				newKey.setAttribute('type', 'text');
			var lenKey = document.querySelector('#keys-poly').childElementCount;
					newKeyLabel.innerText = 'Kunci ' + (lenKey + 1)+ ':';
			var btnRemoveKey = document.createElement('button');
				btnRemoveKey.title = 'Remove';
				btnRemoveKey.innerHTML = 'x';
				btnRemoveKey.style.marginLeft = '2px';
				btnRemoveKey.onclick = function () {
					document.getElementById('keys-poly').removeChild(divKey);
				};

			divKey.appendChild(newKeyLabel);
			divKey.appendChild(newKey);
			divKey.appendChild(btnRemoveKey);
			targetElem.appendChild(divKey);
		}
	}
};

var changeType = function () {
	var typeConvert = document.getElementById('convert-type').value;
	if (typeConvert == 'mono') {
		document.getElementById('container-monoalfabet').style.display = 'block';
		document.getElementById('container-polyalfabet').style.display = 'none';
		// document.getElementById('container-vigenere').style.display = 'none';
	}
	if (typeConvert == 'poly') {
		document.getElementById('container-polyalfabet').style.display = 'block';
		document.getElementById('container-monoalfabet').style.display = 'none';
		// document.getElementById('container-vigenere').style.display = 'none';
	}
	if (typeConvert == 'vigenere') {
		// document.getElementById('container-vigenere').style.display = 'block';
		document.getElementById('container-polyalfabet').style.display = 'none';
		document.getElementById('container-monoalfabet').style.display = 'none';
	}
}