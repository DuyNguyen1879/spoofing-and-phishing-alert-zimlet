#!/bin/bash
ZIMLET_NAME="tk_barrydegraaff_sa_alert"
cd "${ZIMLET_NAME}"
zip -r ../${ZIMLET_NAME}.zip *
cd ..
echo 'An installable version of zimlet was created on: '"${ZIMLET_NAME}"'.zip'

exit 0

