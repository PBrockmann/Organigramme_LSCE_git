//===============================================
// Patrick.Brockmann@cea.fr
//
//===============================================

// d.children when node is open
// d._children when node is closed

//===============================================
function select2DataCollectName(d) {
    if (d.children)
        d.children.forEach(select2DataCollectName);
    else if (d._children)
        d._children.forEach(select2DataCollectName);
    if (d.Person)
        select2Data.push(d.Name + " " + d.Firstname);
    else
        select2Data.push(d.Name);
}

//===============================================
function select2DataCollectEmployer(d) {
    if (d.children)
        d.children.forEach(select2DataCollectEmployer);
    else if (d._children)
        d._children.forEach(select2DataCollectEmployer);
    if (d.Person)
        select2Data.push(d.Employer);
}

//===============================================
function select2DataCollectContract(d) {
    if (d.children)
        d.children.forEach(select2DataCollectContract);
    else if (d._children)
        d._children.forEach(select2DataCollectContract);
    if (d.Person)
        select2Data.push(d.Contract);
}

//===============================================
function select2DataCollectProject(d) {
    if (d.children)
        d.children.forEach(select2DataCollectProject);
    else if (d._children)
        d._children.forEach(select2DataCollectProject);
    if (d.Person) { // project field can be multiple separated by ;
        //console.log(d.Project);
        var mySplitResult = d.Project.split(";");
        for (i = 0; i < mySplitResult.length; i++) {
            var item = mySplitResult[i].trim();
            if (item.length != 0) select2Data.push(item);
        }
    }
}

//===============================================
function select2DataCollectExpertise(d) {
    if (d.children)
        d.children.forEach(select2DataCollectExpertise);
    else if (d._children)
        d._children.forEach(select2DataCollectExpertise);
    if (d.Person) { // expertise field can be multiple separated by ;
        //console.log(d.Expertise);
        var mySplitResult = d.Expertise.split(";");
        for (i = 0; i < mySplitResult.length; i++) {
            var item = mySplitResult[i].trim();
            if (item.length != 0) select2Data.push(item);
        }
    }
}

//===============================================
function select2DataObjectFilter() {
    select2DataObject = [];
    select2Data.sort(function(a, b) {
        if (a > b) return 1; // sort
        if (a < b) return -1;
        return 0;
    })
            .filter(function(item, i, ar) {
        return ar.indexOf(item) === i;
    })// remove duplicate items
            .filter(function(item, i, ar) {
        select2DataObject.push({
            "id": i,
            "text": item
        });
    });
    //console.log(select2DataObject);
}

//===============================================
function sortTree() {
    tree.sort(function(a, b) {
        if (!(a.Person))
            return b.Name.toLowerCase() < a.Name.toLowerCase() ? 1 : -1;
        else
        if (b.Person)
            return b.Name.toLowerCase() < a.Name.toLowerCase() ? 1 : -1;
    });
}

//===============================================
// http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

//===============================================
function searchTree() {
    selectedRoot = new Object();
    selectedRoot.children = new Array();
    searchSelectedTree(root);

    $("#numberValue").html(selectedRoot.children.length);
}

function searchSelectedTree(d) {
    i++;
    if (d.children) {
        d.children.forEach(searchSelectedTree);
    } else if (d._children) {
        d._children.forEach(searchSelectedTree);
    }

    if (isElementOkForAllSelects(d)) {
        // Walk parent chain
        var ancestors = [];
        var parent = d;
        while ("undefined" !== typeof(parent)) {
            ancestors.push(parent);
            parent.class = "found";
            parent = parent.parent;
        }
        if (selectedRoot && selectedRoot.children && selectedRoot.children.indexOf(d) == -1)
            selectedRoot.children.push(d);
    } else if (selectedRoot && selectedRoot.children && selectedRoot.children.indexOf(d) != -1) {
        selectedRoot.children.splice(selectedRoot.children.indexOf(d), 1);
    }
}

function isElementOkForAllSelects(d) {
    if(null == $("#searchName").data().select2.data() && null == $("#searchEmployer").data().select2.data() && null == $("#searchContract").data().select2.data() && null == $("#searchProject").data().select2.data() && null == $("#searchExpertise").data().select2.data())
        return false;

    var isSelectableForName = isElementOkForSelect(d, "#searchName", "d.Name + ' ' + d.Firstname");
    var isSelectableForEmployer = isElementOkForSelect(d, "#searchEmployer", "d.Employer");
    var isSelectableForContract = isElementOkForSelect(d, "#searchContract", "d.Contract");
    var isSelectableForProject = isElementOkForSelect(d, "#searchProject", "d.Project");
    var isSelectableForExpertise = isElementOkForSelect(d, "#searchExpertise", "d.Expertise");
    return isSelectableForName && isSelectableForEmployer && isSelectableForContract && isSelectableForProject && isSelectableForExpertise;
}

function isElementOkForSelect(d, selectId, searchFieldV) {
    var dataSelect = $(selectId).data().select2.data();
    return (null == dataSelect) || ((null != dataSelect) && eval(searchFieldV) && (null != eval(searchFieldV).match(escapeRegExp(dataSelect.text))) && eval(searchFieldV).match(escapeRegExp(dataSelect.text)));
}


function selectAction() {
    divTooltip.style("visibility", "hidden");
    clearAll(root);
    expandAll(root);
    update(root);

    searchTree();
    root.children.forEach(collapseAllNotFound);
    update(root);
    centerNode(root.children[0]);
}

//===============================================
$("#searchName, #searchEmployer, #searchContract, #searchProject, #searchExpertise").on("change", function(e) {
    selectAction();
});

//===============================================
$("#searchName, #searchEmployer, #searchContract, #searchProject, #searchExpertise").on("select2-clearing", function(e) {
    clearAll(root);
    root.children.forEach(collapse);
    update(root);
    centerNode(root.children[0]);
});

//===============================================
function zoom() {
    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

//===============================================
// size of the diagram
var viewerWidth = $(document).width();
var viewerHeight = $(document).height();

var i = 0,
        xwrap = 250,
        xspace = 250,
        duration = 750,
        root, nodes,
        select2Data,
        svgGroup;
var selectedRoot = false;

//var searchField, searchText;

var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

var diagonal = d3.svg.diagonal()
        .projection(function(d) {
    return [d.y, d.x];
});

// define the baseSvg, attaching a class for styling and the zoomListener
var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .call(zoomListener);

// Tooltip
var divTooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden");

d3.select("body").select("svg")
        .on("click", function(d) {
    divTooltip.style("visibility", "hidden");
});

//===============================================
d3.json("../LSCE.json", function(error, treeData) {

    svgGroup = baseSvg.append("g");

    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;
    console.log(root);

    //----------------
    select2Data = [];
    select2DataCollectName(root);
    select2DataObjectFilter();
    $("#searchName").select2({
        data: select2DataObject,
        containerCssClass: "search",
        allowClear: true,
        placeholder: "Search for a Name"
    });

    //----------------
    select2Data = [];
    select2DataCollectEmployer(root);
    select2DataObjectFilter();
    $("#searchEmployer").select2({
        data: select2DataObject,
        containerCssClass: "search",
        allowClear: true,
        placeholder: "Search for an Employer"
    });

    //----------------
    select2Data = [];
    select2DataCollectContract(root);
    select2DataObjectFilter();
    $("#searchContract").select2({
        data: select2DataObject,
        containerCssClass: "search",
        allowClear: true,
        placeholder: "Search for a Contract"
    });

    //----------------
    select2Data = [];
    select2DataCollectProject(root);
    select2DataObjectFilter();
    $("#searchProject").select2({
        data: select2DataObject,
        containerCssClass: "search",
        allowClear: true,
        placeholder: "Search for a Project"
    });

    //----------------
    select2Data = [];
    select2DataCollectExpertise(root);
    select2DataObjectFilter();
    $("#searchExpertise").select2({
        data: select2DataObject,
        containerCssClass: "search",
        allowClear: true,
        placeholder: "Search for an Expertise"
    });

    //----------------
    sortTree();
    root.children.forEach(collapse);
    update(root);
    centerNode(root.children[0]);

});

//===============================================
function update(source) {

    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    var levelWidth = [1];
    var childCount = function(level, n) {

        if (n.children && n.children.length > 0) {
            if (levelWidth.length <= level + 1) levelWidth.push(0);

            levelWidth[level + 1] += n.children.length;
            n.children.forEach(function(d) {
                childCount(level + 1, d);
            });
        }
    };
    childCount(0, root);
    var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
    tree = tree.size([newHeight, viewerWidth]);

    // Compute the new tree layout.
    nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
        d.y = d.depth * xspace;
    });

    // Update the nodes…
    var node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
        return d.id || (d.id = ++i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
            .on("click", toggle);

    nodeEnter.append("circle")
            .attr("r", 0.)
            .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    });

    nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 10)
            .attr("opacity", 0.)
            .style("fill", "red");

    nodeEnter.append("text")
            .attr("x", function(d) {
        return d.children || d._children ? -10 : 10;
    })
            .attr("y", "3")
            .attr("text-anchor", function(d) {
        return d.children || d._children ? "end" : "start";
    })
            .text(function(d) {
        if (d.Person && d.Function && d.Function.length > 0)
        //return d.Function + ": " + d.Name + " " + d.Firstname;
            return d.Name + " " + d.Firstname + " (" + d.Function + ")";
        else if (d.Person)
            return d.Name + " " + d.Firstname;
        else
            return d.Name;
    })
            .style("font-weight", function(d) {
        if (d.children || d._children) return "bold";
        if (d.Function && d.Function.length > 0)
            return d.Function.match(/Chef|Directrice/g) ? "bold" : "normal";
        return "normal";
    })
            .style("fill", function(d) {
        if (d.Function && d.Function.length > 0)
            return d.Function.match(/Chef|Directrice/g) ? "Blue" : "Black";
    })
            .style("fill-opacity", 0.)
            .call(wrap, xwrap)
            .on("mouseover", function(d) {
        if (d.Person) {
            var content = "<div class='name'>" + d.Name + " " + d.Firstname + "</div>";
            //var isImage = UrlExists("Trombinoscope2/" + d.Login + ".jpg");
            //if (isImage)

            //content += "<img class='photo' onerror=\"this.src='default.png'\" src='Trombinoscope2/" + d.Login + ".jpg'></img>";
            content += "<img class='photo' onerror=\"this.src='default.png'\" src='https://intranet.lsce.ipsl.fr/Images/Trombinoscope/" + d.Login + ".jpg'></img>";

            content += "</br><div class='info'>" +
                    "Employeur: " + d.Employer + "</br>" +
                    "Contrat: " + d.Contract + "</br>" +
                    "Projet(s): " + d.Project + "</br>" +
                //"Expertise: " + d.Expertise + "</br>" +
                    d.Site + "</br>" + d.Office + "</br>" +
                    d.Phone + "</br>" +
                    "<a href='mailto:" + d.Email + "'>" + d.Email + "</a>" +
                    "</div>";
            divTooltip.html(content).style("visibility", "visible")
                    .style("opacity", 1.)
                    .style("background", "#EEE")
                    .style("border", "4px solid #999")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY) + "px");

            //.style("left", (d.y + 280) + "px")
            //.style("top", (d.x - 20) + "px");
        } else if (d.Tooltip && d.Tooltip.length > 0) {
            divTooltip
                    .html(d.Tooltip)
                    .style("visibility", "visible")
                    .style("opacity", .75)
                    .style("background", "lightsteelblue")
                    .style("border", "0px")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY) + "px");
        }
    })
            .on("mousemove", function(d) {
        if (!d.Person) {
            divTooltip
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY) + "px");
        }
    })
            .on("mouseout", function(d) {
        if (!d.Person) {
            divTooltip.style("visibility", "hidden");
        }
    });

    // Transition nodes to their new position.
    var nodeUpdate = node
            .transition().duration(duration)
            .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
    });

    nodeUpdate.select("circle")
            .attr("r", 4.5)
            .style("fill", function(d) {
        if (d.class === "found") {
            return "#ff4136"; //red
        } else if (d._children) {
            return "lightsteelblue";
        } else {
            return "#fff";
        }
    })
            .style("stroke", function(d) {
        if (d.class === "found") {
            return "#ff4136"; //red
        }
    });

    nodeUpdate.select(".ghostCircle")
            .attr("opacity", function(d) {
        if (d.Person && d.class === "found")
            return 0.2;
        else
            return 0.0;
    });

    nodeUpdate.select("text")
            .style("fill-opacity", 1.);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit()
            .on("mouseover", null)
            .on("mouseout", null)
            .transition().duration(duration)
            .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
    })
            .remove();

    nodeExit.select("circle")
            .attr("r", 2.0);

    nodeExit.select("text")
            .style("fill-opacity", 0.);

    // Update the links…
    var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
        return d.target.id;
    });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
        var o = {
            x: source.x0,
            y: source.y0
        };
        return diagonal({
            source: o,
            target: o
        });
    });

    // Transition links to their new position.
    link
            .transition().duration(duration)
            .attr("d", diagonal)
            .style("stroke", function(d) {
        if (d.target.class === "found") {
            return "#ff4136";
        }
    });

    // Transition exiting nodes to the parent's new position.
    link.exit()
            .transition().duration(duration)
            .attr("d", function(d) {
        var o = {
            x: source.x,
            y: source.y
        };
        return diagonal({
            source: o,
            target: o
        });
    })
            .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

}

//===============================================
function clearAll(d) {
    d.class = "";
    if (d.children)
        d.children.forEach(clearAll);
    else if (d._children)
        d._children.forEach(clearAll);
}

//===============================================
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

//===============================================
function collapseAllNotFound(d) {
    if (d.children) {
        if (d.class !== "found") {
            d._children = d.children;
            d._children.forEach(collapseAllNotFound);
            d.children = null;
        } else
            d.children.forEach(collapseAllNotFound);
    }
}

//===============================================
function expandAll(d) {
    if (d._children) {
        d.children = d._children;
        d.children.forEach(expandAll);
        d._children = null;
    } else if (d.children)
        d.children.forEach(expandAll);
}

//===============================================
// Toggle children on click.
function toggle(d) {
    if (d.children) { // close an open node
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children; // open a closed node
        d._children = null;
    }
    clearAll(root);
    update(d);
    $("#searchName").select2("val", "");
    $("#searchEmployer").select2("val", "");
    $("#searchContract").select2("val", "");
    $("#searchProject").select2("val", "");
    centerNode(d);
}

//===============================================
// http://bl.ocks.org/mbostock/7555321
function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineStart = 3,
                lineHeight = 14,
                x = text.attr("x"),
                y = text.attr("y"),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", ++lineNumber * lineHeight + lineStart).text(word);
            }
        }
    });
}

//===============================================
function centerNode(source) {
    //scale = zoomListener.scale();
    scale = 1;
    x = -source.y0;
    y = -source.x0;
    //x = x * scale + viewerWidth / 2;
    x = 50;
    y = y * scale + viewerHeight / 3;
    d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    zoomListener.scale(scale);
    zoomListener.translate([x, y]);
}


function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return 404 != http.status;
}
