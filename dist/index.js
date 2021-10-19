/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 181:
/***/ ((module) => {

/* PUBLIC METHODS */
/**
 * Check CIDv0 legality
 * @param {string} cid 
 * @returns boolean
 */
function checkCid(cid) {
    return cid.length === 46 && cid.substr(0, 2) === 'Qm';
}

function parsObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = {
    checkCid,
    parsObj
}

/***/ }),

/***/ 927:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 5:
/***/ ((module) => {

module.exports = eval("require")("@crustio/type-definitions");


/***/ }),

/***/ 684:
/***/ ((module) => {

module.exports = eval("require")("@polkadot/api");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(927);
const { ApiPromise, WsProvider } = __nccwpck_require__(684);
const { typesBundleForPolkadot } = __nccwpck_require__(5);
const { checkCid, parsObj } = __nccwpck_require__(181);

async function main() {
    // 1. Get all inputs
    const cid = core.getInput('cid'); // Currently, we only support CIDv0
    const chainAddr = core.getInput('crust-endpoint');
    const fileReplica = core.getInput('file-replica');
    var maxAttempts = core.getInput('max-attempts');

    console.log('cid', cid)
    console.log('chainAddr', chainAddr)

    // 2. Check cid
    if (!checkCid(cid)) {
        throw new Error('Illegal inputs');
    }

    // 3. Try to connect to Crust Chain
    const chain = new ApiPromise({
        provider: new WsProvider(chainAddr),
        typesBundle: typesBundleForPolkadot
    });

    await chain.isReadyOrError;

    var file
    do
    {
        file = parsObj(await chain.query.market.files(cid));
        if (file && file.reported_replica_count >= fileReplica)
            break;
        if (maxAttempts > 1) {
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    } while (--maxAttempts > 0)

    console.log('file', file)

    if (file) {
        console.log('reported_replica_count', file.reported_replica_count)
        core.setOutput('replicaCount', file.reported_replica_count);
    } else {
        console.log('File not found or no replicas')
        core.setOutput('replicaCount', 0);
    }

    await chain.disconnect();
}

main().catch(error => {
    core.setFailed(error.message);
});

})();

module.exports = __webpack_exports__;
/******/ })()
;