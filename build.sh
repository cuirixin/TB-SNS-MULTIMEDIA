#!/bin/sh
#work_path=`pwd` && cd .. && sudo rm -rf Module_tmp && mkdir Module_tmp && cp -r ./Module/module/* ./Module_tmp/ && cd Module_tmp && sudo find . -name .svn | xargs rm -rf && cd $work_path && cp -R ../Module_tmp/* ./module/ && echo "Success."
cp -r `ls | grep -v build | xargs` ./build && cd ./build && rm -rf logs && rm -rf uploads && rm -rf config && \cp -rf * ../../TB-SNS-MULTIMEDIA/