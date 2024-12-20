#!/bin/bash

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

WD="$SCRIPTPATH/.."

mkdir -p $WD/assets
cp "$WD/scripts/create-ec2-ami.sh" "$WD/assets/"

declare -a source_repo=(base-image kas meta-aws-demo nxp-imx poky poky-ami renesas)

for pipeline in "${source_repo[@]}"
do
  if [ -f $WD/assets/pipeline-source-$pipeline/source-$pipeline.zip ]; then 
    rm -rf $WD/assets/pipeline-source-$pipeline
  fi
  mkdir -p $WD/assets/pipeline-source-$pipeline/
  cd $WD/source-repo/$pipeline
  zip -q -o $WD/assets/pipeline-source-$pipeline/source-$pipeline.zip -r *
done


