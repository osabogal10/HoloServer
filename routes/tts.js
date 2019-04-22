var express = require('express');
// To install dependencies, run: npm install
const xmlbuilder = require('xmlbuilder');
// request-promise has a dependency on request
const rp = require('request-promise');
const fs = require('fs');

var router = express.Router();

/* GET users listing. */
router.post('/', async function (req, res) {

  const text = req.body.text
  const filename = req.body.filename

  try {
    const subscriptionKey = process.env.SPEECH_SERVICE_KEY;
    if (!subscriptionKey) 
    {
      throw new Error('Environment variable for your subscription key is not set.')
    }

    const accessToken = await getAccessToken(subscriptionKey);
    console.log(accessToken);
    await textToSpeech(accessToken, text, filename, () => {
      res.status(200).send({ success: true, message: 'Text-to-Speech generado con exito' })
    });
  } catch (err) {
    res.status(500).send({ success: false, message: `Something went wrong: ${err}` })
    console.log(`Something went wrong: ${err}`);
  }
});

// Gets an access token.
function getAccessToken(subscriptionKey) {
  let options = {
    method: 'POST',
    uri: 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken',
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey
    }
  }
  return rp(options);
}

// Converts text to speech using the input from readline.
function textToSpeech(accessToken, text, filename, success) {
  // Create the SSML request.
  let xml_body = xmlbuilder.create('speak')
    .att('version', '1.0')
    .att('xml:lang', 'es-es')
    .ele('voice')
    .att('xml:lang', 'es-es')
    .att('name', 'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)')
    .txt(text)
    .end();
  // Convert the XML into a string to send in the TTS request.
  let body = xml_body.toString();

  let options = {
    method: 'POST',
    baseUrl: 'https://westus.tts.speech.microsoft.com/',
    url: 'cognitiveservices/v1',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'cache-control': 'no-cache',
      'User-Agent': 'YOUR_RESOURCE_NAME',
      'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
      'Content-Type': 'application/ssml+xml'
    },
    body: body
  }

  let request = rp(options)
    .on('response', (response) => {
      if (response.statusCode === 200) {
        request.pipe(
          fs.createWriteStream(`./public/${filename}.wav`)
            .on('close', () => {
              success();
              console.log('\nYour file is ready.\n')
            }));
      }
    });
  return request;

};


module.exports = router;
