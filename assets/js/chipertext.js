var regex = /^[a-zA-Z]*$/;
var chipertextModule = {
	abjad: () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
	init: (func, subFunc = 'generate') => { chipertextModule[func][subFunc]() },
	createTableAbjad: function (containerTarget) {
		var arrAbjad = chipertextModule.abjad();
		var oriAbjadTable = document.querySelector('#'+ containerTarget +' .original-abjad');
		var tbodyAbjad = document.createElement('tbody');
		var trText = document.createElement('tr');
		var trIndex = document.createElement('tr');

		oriAbjadTable.innerHTML = '';
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
	},
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

			var arrAbjad = _self.abjad();
			_self.createTableAbjad('result-monoalfabet');

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
				var valKey = e.querySelector('input[type=text]').value.replace(/\s/g,'');
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
	},
	vigenereAngka: {
		generate: function () {
			var _self = chipertextModule;

			var plaintext = document.getElementById('plaintext-val').value.replace(/\s/g,'').toUpperCase();
			var kunciAngka = document.getElementById('kunci-vigAngka').value.split(',');
			var resVigAngkaTable = document.getElementById('result-vigAngka-table');
			var arrAbjad = _self.abjad();
			var isNotValidKey = false;
			var keyIsmore26 = false;
			var isEmpty = plaintext === '' || document.getElementById('kunci-vigAngka').value === '';
			var alertText = 'Tidak boleh kosong.';


			kunciAngka = kunciAngka.map((key) => {
				key = parseInt(key);

				if (key > 26) { keyIsmore26 = true; }

				return key;
			});

			if (keyIsmore26) {
				alertText = 'Masukan angka kunci maksimal 26';
			}

			if (isEmpty || keyIsmore26) {
				alert(alertText);
				return false;
			}

			document.getElementById('result-vigAngka').style.display = 'block';

			_self.createTableAbjad('result-vigAngka');

			document.getElementById('result-vigAngka-table').innerHTML = '';
			var lenKunciAngka = kunciAngka.length;
			var tbodyTable = document.createElement('tbody');
			var trPlaintext = document.createElement('tr');
			var trKunci = document.createElement('tr');
			var trIndexAbjad = document.createElement('tr');
				trIndexAbjad.style.borderBottom = '2px solid';
			var trReducResult = document.createElement('tr');
			var trChipertext = document.createElement('tr');

			var lblPlain = document.createElement('td');
				lblPlain.innerHTML = 'Plaintext:';
			var lblKunci = document.createElement('td');
				lblKunci.innerHTML = 'Kunci:';
			var lblIndex = document.createElement('td');
				lblIndex.innerHTML = 'Index:';
			var lblIndexAkhir = document.createElement('td');
				lblIndexAkhir.innerHTML = 'Index Akhir:';
			var lblChipertext = document.createElement('td');
				lblChipertext.innerHTML = 'Chipertext:';
			trPlaintext.appendChild(lblPlain);
			trKunci.appendChild(lblKunci);
			trIndexAbjad.appendChild(lblIndex);
			trReducResult.appendChild(lblIndexAkhir);
			trChipertext.appendChild(lblChipertext);

			var idx = 0;
			plaintext.split('').forEach((text) => {
				var tdText = document.createElement('td');
					tdText.innerHTML = text;
				var tdAngka = document.createElement('td');
					if (idx > lenKunciAngka - 1) { idx = 0; }
					tdAngka.innerHTML = kunciAngka[idx];
				var tdIndexAbjad = document.createElement('td');
					tdIndexAbjad.innerHTML = arrAbjad.indexOf(text);
				var tdReducResult = document.createElement('td');
				var reducResult = parseInt(kunciAngka[idx]) + parseInt(arrAbjad.indexOf(text));
				var idxResult = reducResult > 25 ? reducResult - 26 : reducResult;
					tdReducResult.innerHTML = idxResult;
				var tdChipertext = document.createElement('td');
					tdChipertext.innerHTML = arrAbjad[idxResult];

				trPlaintext.appendChild(tdText);
				trKunci.appendChild(tdAngka);
				trIndexAbjad.appendChild(tdIndexAbjad);
				trReducResult.appendChild(tdReducResult);
				trChipertext.appendChild(tdChipertext);
				idx++;
			});

			tbodyTable.appendChild(trPlaintext);
			tbodyTable.appendChild(trKunci);
			tbodyTable.appendChild(trIndexAbjad);
			tbodyTable.appendChild(trReducResult);
			tbodyTable.appendChild(trChipertext);
			resVigAngkaTable.appendChild(tbodyTable);
		},
		reset: function () {
			document.getElementById('result-vigAngka').style.display = 'none';
			document.getElementById('plaintext-val').value = '';
			document.getElementById('kunci-vigAngka').value = '';
			document.getElementById('result-vigAngka-table').innerHTML = '';
		}
	},
	vigenereHuruf: {
		generate: function () {
			var _self = chipertextModule;
			var plaintext = document.getElementById('plaintext-val').value.replace(/\s/g,'').toUpperCase().split('');
			var kunciHuruf = document.getElementById('kunci-vigHuruf').value.replace(/\s/g,'').toUpperCase().split('');
			var resVigHurufTable = document.getElementById('result-vigHuruf-table');
			var paternTable = document.getElementById('patern-table');
			var arrAbjad = _self.abjad();
			var isEmpty = plaintext === '' || document.getElementById('kunci-vigHuruf').value === '';
			var isNotExpectText = !regex.test(plaintext.join(''));
			var isNotExpectKey = !regex.test(kunciHuruf.join(''));
			var alertText = 'Tidak boleh kosong.';

			if (isNotExpectText || isNotExpectKey) {
				alertText = 'Hanya boleh huruf.';
			}

			if (isEmpty || isNotExpectKey || isNotExpectText) {
				alert(alertText);
				return false;
			}

			document.getElementById('result-vigHuruf').style.display = 'block';

			paternTable.innerHTML = '';
			resVigHurufTable.innerHTML = '';

			var trPlaintext = document.createElement('tr');
			var lblPlaintext = document.createElement('td');
				lblPlaintext.innerHTML = 'Plaintext:';
			var trKunci = document.createElement('tr');
			var lblKunci = document.createElement('td');
				lblKunci.innerHTML = 'Kunci:';

			trPlaintext.appendChild(lblPlaintext);
			trKunci.appendChild(lblKunci);

			var resultKunci = [];
			var idxKunci = 0;
			plaintext.forEach((text, i) => {
				idxKunci = idxKunci > kunciHuruf.length - 1 ? 0 : idxKunci;
				var td = document.createElement('td');
					td.innerHTML = text;
				var tdKunci = document.createElement('td');
					tdKunci.innerHTML = kunciHuruf[idxKunci];
					resultKunci.push(kunciHuruf[idxKunci]);

				trPlaintext.appendChild(td);
				trKunci.appendChild(tdKunci);
				idxKunci++;
			});

			resVigHurufTable.appendChild(trPlaintext);
			resVigHurufTable.appendChild(trKunci);

			var arrPatern = [];
			var arrElemTd = [];
			arrAbjad.forEach((abjadRow, row) => {
				var tr = document.createElement('tr');
				var loopLimit = 26 + row;
				var arrRow = [];
				var arrRowElem = [];

				if (row === 0) {
					var trLabelColSpan = document.createElement('tr');
					var tdColspan = document.createElement('td');
						tdColspan.innerHTML = 'Plaintext';
						tdColspan.setAttribute('colspan', 28);
						tdColspan.style.textAlign = 'center';
					var firstTr = document.createElement('tr');
					var blankTd = document.createElement('td');
						blankTd.innerHTML = '';
					var tdLabelRowSpan = document.createElement('td');
						tdLabelRowSpan.innerHTML = 'Kode Kunci';
						tdLabelRowSpan.setAttribute('rowspan', 27);
						tdLabelRowSpan.style.transform = 'rotate(-90deg)';
						tdLabelRowSpan.style.width = '2px';
					trLabelColSpan.style.background = '#e2e3e4';
					trLabelColSpan.appendChild(tdColspan);
					firstTr.appendChild(tdLabelRowSpan);
					firstTr.appendChild(blankTd);
					firstTr.style.background = '#e2e3e4';

					for (var i = 0; i < 26; i++) {
						var tdFirstRow = document.createElement('td');
							tdFirstRow.innerHTML = arrAbjad[i].toLowerCase();
						firstTr.appendChild(tdFirstRow);
					}
					paternTable.appendChild(trLabelColSpan);
					paternTable.appendChild(firstTr);
				}

				for (var i = row; i < loopLimit; i++) {
					var idxCol = i > 25 ? i - 26 : i;
					var abjadCol = arrAbjad[idxCol];
					var td = document.createElement('td');
						td.innerHTML = abjadCol;

					if (i === row) {
						var firstTd = document.createElement('td');
							firstTd.innerHTML = abjadCol.toLowerCase();
							firstTd.style.background = '#e2e3e4';
						tr.appendChild(firstTd);
					}

					tr.appendChild(td);
					arrRow.push(abjadCol);
					arrRowElem.push(td);
				}
				paternTable.appendChild(tr);
				arrPatern.push(arrRow);
				arrElemTd.push(arrRowElem);
			});

			var trChipertext = document.createElement('tr');
			var tdChipertext = document.createElement('td');
				tdChipertext.innerHTML = 'Chipertext:';
			trChipertext.appendChild(tdChipertext);

			var resultChiptertext = plaintext.map((plText, idxText) => {
				var kcText = resultKunci[idxText];
				var idxPlainOnAbjad = arrAbjad.indexOf(plText);
				var idxKunciOnAbjad = arrAbjad.indexOf(kcText);
				var resultChar = arrPatern[idxKunciOnAbjad][idxPlainOnAbjad];
				var targetTd = arrElemTd[idxKunciOnAbjad][idxPlainOnAbjad];
				var tdChipertext = document.createElement('td');
					tdChipertext.innerHTML = resultChar;
				trChipertext.appendChild(tdChipertext);
				targetTd.style.background = 'black';
				targetTd.style.color = 'white';
				return resultChar;
			});
			resVigHurufTable.appendChild(trChipertext);
		},
		reset: function () {
			document.getElementById('result-vigHuruf').style.display = 'none';
			document.getElementById('plaintext-val').value = '';
			document.getElementById('kunci-vigHuruf').value = '';
			document.getElementById('result-vigHuruf-table').innerHTML = '';
		}
	},
	zigzag: {
		generate: function () {
			var plaintext = document.getElementById('plaintext-val').value.replace(/\s/g,'').toUpperCase().split('');
			var lenZigzag = document.getElementById('length-zigzag').value;
			var zigzagTable = document.getElementById('zigzag-table');
			var alertText = 'Tidak boleh kosong';
			var isEmpty = lenZigzag === '' || plaintext.join('') === '';
			var isNotExpectText = !regex.test(plaintext.join(''));
			var isNotExpectZigzagVal = lenZigzag < 2;

			if (isNotExpectZigzagVal) {
				alertText = 'Masukan panjang zig-zag minimal 2.';
			}

			if (isNotExpectText) {
				alertText = 'Masukan plaintext dengan format huruf.';
			}

			if (isEmpty || isNotExpectText || isNotExpectZigzagVal) {
				alert(alertText);
				return false;
			}

			document.getElementById('result-zigzag').style.display = 'block';

			var arrZigzag = [];
			for (var i = 0; i < lenZigzag; i++) {
				var r = plaintext.map(text => 5);
				arrZigzag.push(r);
			}

			var countZigzag = 1;
			var lastGrepIdx = lenZigzag - 1;
			var lastIdxPlText = -1;
			var lastRow = 0;
			var plaintextProcess = _.clone(plaintext);
			while (plaintextProcess.length) {
				var isMenurun = countZigzag % 2 === 0;
				for (var i = 0; i < lenZigzag; i++) {

					if (i > 0) {
						if (isMenurun) {
							lastGrepIdx++;
						} else {
							lastGrepIdx--;
						}
					}

					if (i > 0 || lastIdxPlText < 0) {
						lastIdxPlText++;
						plaintextProcess.pop();
					}

					arrZigzag[lastGrepIdx][lastIdxPlText] = plaintext[lastIdxPlText] || 'X';
				}
				countZigzag++;
			}

			var arrRowTerpanjang = 0;
			arrZigzag.forEach((row) => {
			  var len = row.length;
			  if (len > arrRowTerpanjang) {
			  	arrRowTerpanjang = len;
			  }
			});

			arrZigzag.forEach((row) => {
				while(row.length < arrRowTerpanjang) {
					row.push(5);
				}
			});

			zigzagTable.innerHTML = '';
			for (var i = 0; i < arrZigzag.length; i++) {
				var row = arrZigzag[i];
				var tr = document.createElement('tr');

				for (var j = 0; j < row.length; j++) {
					var td = document.createElement('td');
						td.innerHTML = typeof row[j] === 'number' || !row[j] ? '' : row[j];
					tr.appendChild(td);
				}
				zigzagTable.appendChild(tr);
			}

		  	var chipertext = '';
			arrZigzag.forEach((row) => {
				row.forEach((dt) => {
					if (typeof dt !== 'number' || !dt) {
						chipertext += dt;
					}
				});
			});
			$('#result-zigzag-chipertext').text(chipertext);
		},
		reset: function () {
			document.getElementById('result-zigzag').style.display = 'none';
			document.getElementById('plaintext-val').value = '';
			document.getElementById('length-zigzag').value = '';
			document.getElementById('result-zigzag-chipertext').innerHTML = '';
		}
	},
	segitiga: {
		generate: function () {
			var plaintext = document.getElementById('plaintext-val').value.replace(/\s/g,'').toUpperCase().split('');
			var isEmpty = plaintext.join('') === '';
			var isNotExpectText = !regex.test(plaintext.join(''));
			var isLessThan2Char = plaintext.length < 2;
			var alertText = 'Tidak boleh kosong.';

			if (isEmpty || isNotExpectText || isLessThan2Char) {
				alertText = isNotExpectText ? 'Hanya boleh huruf.' :
					(isLessThan2Char ? 'Plaintext minimum 2 karakter.' : alertText);
				alert(alertText);
				return false;
			}

			document.getElementById('result-segitiga').style.display = 'block';

			var plaintextProcess = _.clone(plaintext);
			var lenPop = 1;
			var arrSegitiga = [];

			while(plaintextProcess.length) {
				var arrRow = [];
				for (var i = 0; i < lenPop; i++) {
					var pushValue = plaintextProcess.shift() || 'X';
					arrRow.push(pushValue);
				}
				arrSegitiga.push(arrRow);
				lenPop += 2;
			}

			var getMedianIdxLongestArray = (key) => {
				var longest = 0;
				arrSegitiga.forEach((row) => {
				  if (longest < row.length) {
				  	longest = row.length;
				  }
				});

				var obj = {
					median: Math.floor(longest/2),
					longest: longest
				};

				return obj[key];
			};
			var prettifyArr = (arr) => {
				var medianDt = getMedianIdxLongestArray('median');
				var longestDt = getMedianIdxLongestArray('longest');
				for (var i = 0; i < arr.length; i++) {
					var row = arr[i];
					var lenUnshift = medianDt - i;

					for (var j = 0; j < lenUnshift; j++) {
						row.unshift(0);
					}

					while(row.length < longestDt) {
						row.push(0);
					}
				}

				return arr;
			};
			var getChipertext = (arr) => {
				var idxCheck = 0;
				var longest = getMedianIdxLongestArray('longest');
				var chpText = '';

				for (var i = 0; i < longest; i++) {
					for (var j = 0; j < arr.length; j++) {
						var char = arr[j][i];
						if (typeof char !== 'number') {
							chpText += char;
						}
					}
				}
				return chpText;
			};

			prettifyArr(arrSegitiga);

			var chipertext = getChipertext(arrSegitiga);

			$('#segitiga-table').empty();
			for (var i = 0; i < arrSegitiga.length; i++) {
				var r = arrSegitiga[i];
				var tr = document.createElement('tr');

				for (var j = 0; j < r.length; j++) {
					var dt = typeof r[j] === 'number' ? '' : r[j];
					$(tr).append(`<td>${dt}</td>`);
				}
				$('#segitiga-table').append(tr);
			}
			$('#result-segitiga-chipertext').text(chipertext);
		},
		reset: function () {
			document.getElementById('result-segitiga').style.display = 'none';
			document.getElementById('plaintext-val').value = '';
			document.getElementById('result-segitiga-chipertext').innerHTML = '';
		}
	}
};

var changeType = function () {
	var typeConvert = document.getElementById('convert-type').value;

	document.getElementById('container-monoalfabet').style.display = 'none';
	document.getElementById('container-polyalfabet').style.display = 'none';
	document.getElementById('container-vigAngka').style.display = 'none';
	document.getElementById('container-vigHuruf').style.display = 'none';
	document.getElementById('container-zigzag').style.display = 'none';
	document.getElementById('container-segitiga').style.display = 'none';

	if (typeConvert == 'mono') {
		document.getElementById('container-monoalfabet').style.display = 'block';
	}
	if (typeConvert == 'poly') {
		document.getElementById('container-polyalfabet').style.display = 'block';
	}
	if (typeConvert == 'vigenere-angka') {
		document.getElementById('container-vigAngka').style.display = 'block';
	}
	if (typeConvert == 'vigenere-huruf') {
		document.getElementById('container-vigHuruf').style.display = 'block';
	}
	if (typeConvert == 'permutasi-zigzag') {
		document.getElementById('container-zigzag').style.display = 'block';
	}
	if (typeConvert == 'permutasi-segitiga') {
		document.getElementById('container-segitiga').style.display = 'block';
	}
}