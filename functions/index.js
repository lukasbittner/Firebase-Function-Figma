const functions = require('firebase-functions')
const axios = require('axios')
const { config } = require('firebase-functions')
const cors = require('cors')({ origin: true })

// The function called to fetch ticket data from Jira
exports.getIssue = functions.https.onRequest(async(req, res) => {
    cors(req, res, () => {})
    const { basicAuth, companyName, issueIds } = JSON.parse(req.body)

    configArray = []

    // Prepare a config object for every issue ID
    for (let i = 0; i < issueIds.length; i++) {
        const id = issueIds[i]
        const ticket_url = `https://${companyName}.atlassian.net/rest/agile/1.0/issue/${id}`;
        const configData =
            axios({
                method: 'get',
                url: ticket_url,
                headers: {
                    'Authorization': 'Basic ' + basicAuth
                }
            })
            .then(function(response) {
                return response.data
            })
            .catch(function(error) {
                // If there is a reponse of the server, send back that data so the error message can be read by the plugin
                if (error.response.data) {
                    return error.response.data
                } else {
                    return error
                }
            })
        configArray.push(configData)
    }

    // Make on API call for all issue IDs
    // Returns an array of JSON objects filled with ticket data
    axios.all(configArray)
        .then(axios.spread(function(...responses) {
            // console.log("---------- Data fetched from Firebase ---------", responses)
            res.send(responses)
        }))
        .catch(function(error) {
            error
        })
})

// The function called to fetch ticket data from Jira
exports.postLinkToIssue = functions.https.onRequest(async(req, res) => {
    cors(req, res, () => {})
    const { basicAuth, companyName, issueId, bodyData } = JSON.parse(req.body)


    const remotelink_url = `https://${companyName}.atlassian.net/rest/api/3/issue/${issueId}/remotelink`;
    const configData = {
        method: 'post',
        url: remotelink_url,
        headers: {
            'Authorization': 'Basic ' + basicAuth,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: bodyData
    }
    axios(configData)
        .then(function(response) {
            res.send(response.data)
        })
        .catch(function(error) {
            res.send(error)
        })
})


// The function called test wether the user has entered the right authentication details.
exports.testAuthentication = functions.https.onRequest(async(req, res) => {
    cors(req, res, () => {})
    const { basicAuth, companyName } = JSON.parse(req.body)

    const auth_url = `https://${companyName}.atlassian.net/rest/api/3/myself`;
    const configData = {
        method: 'get',
        url: auth_url,
        headers: {
            'Authorization': 'Basic ' + basicAuth
        }
    }
    axios(configData)
        .then(function(response) {
            res.send(response.data)
        })
        .catch(function(error) {
            res.send(error)
        })
})