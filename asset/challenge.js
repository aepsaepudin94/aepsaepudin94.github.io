$(document).ready(function () {
	$('#calculate').bind('click', function () {
		var textObj = {
			word: [],
			char: []
		};

		function calcChar(dt) {
			$('#char').empty();
			var $valChar = $('#value').val().split('');
			for (var i = 0; i < $valChar.length; i++) {
				var checkChar = dt.filter(function (a) {
					return a === $valChar[i].toLowerCase();
				});
				if (!checkChar.length && $valChar[i] != ' ') {
					dt.push($valChar[i].toLowerCase());
				}
			}
			dt.sort();
			$('#char').append('<a>Hasil kalkulasi Karakter :</a>');
			for (var j = 0; j < dt.length; j++) {
				var charCount = $valChar.filter(function (b) {
					return b.toLowerCase() === dt[j];
				});
				var resultChar = document.createElement('p');
					resultChar.innerHTML = dt[j]+' : '+charCount.length+' kali';
				$('#char').append(resultChar);
			}
		}

		function calcWord(dt) {
			$('#word').empty();
			var $valWord = $('#value').val().split(' ');
			for (var i = 0; i < $valWord.length; i++) {
				var checkWord = dt.filter(function (a) {
					return a === $valWord[i].toLowerCase();
				});
				if (!checkWord.length) {
					dt.push($valWord[i].toLowerCase());
				}
			}
			dt.sort();
			$('#word').append('<a>Hasil kalkulasi Kata :</a>');
			for (var j = 0; j < dt.length; j++) {
				var wordCount = $valWord.filter(function (b) {
					return b.toLowerCase() === dt[j];
				});
				var resultWord = document.createElement('p');
					resultWord.innerHTML = dt[j]+' : '+wordCount.length+' kali';
				$('#word').append(resultWord);
			}
		}
		calcWord(textObj.word);
		calcChar(textObj.char);
	});
});