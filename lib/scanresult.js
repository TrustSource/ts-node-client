/*
 * Copyright (c) 2015. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 */

Dependency = require("./dependency");

function ScanResult(project, module, moduleId, dependencies) {
    this.project = project;
    this.module = module;
    this.moduleId = moduleId;
    this.dependencies = [];


    if(dependencies instanceof Dependency) {
        this.dependencies.push(dependencies);
    } else if(dependencies instanceof Object) {
        // works also for arrays
        for(var key in dependencies){
            if(dependencies[key] instanceof Dependency) {
                this.dependencies.push(dependencies[key]);
            }
        }
    }
}


module.exports = ScanResult;