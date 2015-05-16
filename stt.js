/*
 * Short Truth Table Generator
 * WIP v -3.0 pre-alpha
 * Code by Chris Chappell
 *
 *
 *
 */



var ERR = -1;
var err_loc = 0;
var err_st = "";
next_id = 0;

function seterr ( loc, st ) {
  err_loc = loc;
  err_st = st;
  return ERR;
}

function printerr (i) {
  // TODO: shade error input field red
  // and add an error message
  console.log(err_st+" "+err_loc);
}

function getOP ( c ) {
  if ( c == "~" ) {
    return "&not;";
  }
  else if ( c == "&" ) {
    return "&and;";
  }
  else if ( c == "|" ) {
    return "&or;";
  }
  else if ( c == ">" ) {
    return "&rarr;";
  }
  else if ( c == "=" ) {
    return "&harr;";
  }
}

$(document).ready( function() {
  var context = {
    stindex: 0,
    cindex: 0,
    rindex: 0,
    tfindex: 0,
    bramList: [],
    clist: [],
    tflist: []
  };

  function makeBram ( st, parent ) {
    //console.log(st + " " + parent);
    err_st = st;
    var depth = 0;
    var flag = true;
    if( st == "" ) {
      return seterr( 0, "empty text field" );
    }
    for ( var i = 0; i < st.length; ++i ) {

      if ( st[i] == "(" ) {
        ++depth;
      }
      if ( depth == 0 ) {
        flag = false;
      }
      if ( st[i] == ")" ) {
        --depth;
      }
      if ( depth < 0 ) {
        return seterr( i-1, st );
      }
    }
    if ( depth != 0 ) {
      return seterr( i, st );
    }
    //console.log( st + " " + flag );
    if ( flag ) {
      return makeBram( st.substring( 1, st.length-1 ), parent );
    }

    var bram = {};
    var op = '';
    var split = [];
    for ( var i = 0; i < st.length; ++i ) {

      var c = st[i]
      if ( c == "(" ) {
        ++depth;
      }
      else if ( c == ")" ) {
        --depth;
      }
      else if ( depth == 0 ) {
        if ( c == "=" || c == "%" ) {
          if ( op == "=" ) {
            return seterr( st, i );
          }
          else {
            split.length = 0;
            split.push(i);
            op = "=";
          }
        }
        else if ( c == ">" || c == "$" ) {
          if ( op == ">" ) {
            return seterr( st, i );
          }
          else {
            split.length = 0;
            split.push(i);
            op = ">";
          }
        }
        else if ( c == "|" ) {
          if ( op == "|" ) {
            split.push(i);
          }
          else {
            split.length = 0;
            split.push(i);
            op = "|";
          }
        }
        else if ( c == "&" ) {
          if ( op == "&" ) {
            split.push(i);
          }
          else if ( op != "|" ) {
            split.length = 0;
            split.push(i);
            op = "&";
            //console.log(i + " " + st[i]);
          }
        }
        else if ( c == "~" ) {
          if ( op == "~" ) {
            return seterr( i, st );
          }
          else if ( op == "" ) {
            split[split.length] = op;
            op = "~";
          }
        }
      }
    }
    bram.op = op;
    if ( split.length > 0 ) {
      bram.child = [];
      if ( op == "~" ) {
        if ( split[0] != 0 ) {
          return seterr( split[0], st );
        }
        else {
          bram.child.push( makeBram( st.substring( 1, st.length ), bram ) );
        }
      }
      else if ( op == "&" ) {
        if ( split[0] == 0 ) {
          return seterr( split[0], st );
        }
        else if ( split[split.length-1] == st.length-1 ) {
          return seterr( split[split.length-1], st );
        }
        else {
          bram.child.push( makeBram( st.substring( 0, split[0] ), bram ) );
          for ( var i = 0; i < split.length-1; ++i ) {
            bram.child.push( makeBram( st.substring( split[i]+1, split[i+1] ), bram ) );
          }
          bram.child.push( makeBram( st.substring( split[split.length-1]+1, st.length ), bram ) );
        }
      }
      else if ( op == "|" ) {
        if ( split[0] <= 0 ) {
          return seterr( split[0], st );
        }
        else if ( split[split.length-1] >= st.length-1 ) {
          return seterr( split[split.length-1], st );
        }
        else {
          bram.child.push( makeBram( st.substring( 0, split[0] ), bram ) );
          for ( var i = 0; i < split.length-1; ++i ) {
            bram.child.push( makeBram( st.substring( split[i]+1, split[i+1] ), bram ) );
          }
          bram.child.push( makeBram( st.substring( split[split.length-1]+1, st.length ), bram ) );
        }
      }
      else if ( op == ">" ) {
        if ( split[0] <= 0 ) {
          return seterr( split[0], st );
        }
        else if ( split[split.length-1] >= st.length-1 ) {
          return seterr( split[split.length-1], st );
        }
        else {
          bram.child.push( makeBram( st.substring( 0, split[0] ), bram ) );
          bram.child.push( makeBram( st.substring( split[0]+1, st.length ), bram ) );
        }
      }
      else if ( op == "=" ) {
        if ( split[0] <= 0 ) {
          return seterr( split[0], st );
        }
        else if ( split[split.length-1] >= st.length-1 ) {
          return seterr( split[split.length-1], st );
        }
        else {
          bram.child.push( makeBram( st.substring( 0, split[0] ), bram ) );
          bram.child.push( makeBram( st.substring( split[0]+1, st.length ), bram ) );
        }
      }
      else {
        return seterr( 0, st );
      }
      for ( var i = 0; i < bram.child.length; ++i ) {
        if ( bram.child[i] == ERR ) {
          return ERR;
        }
      }
    }
    else {
      bram.st = st;
    }
    bram.parent = parent;
    return bram;
  }
  
  function addColumns ( bram ) {
    var st = "";
    if ( bram.op == "&" || bram.op == "|" || bram.op == ">" || bram.op == "=" ) {
      //console.log(bram);
      if ( bram.parent != null ) {
        st += makeColumnHeader("(");
      }
      for ( var i = 0; i < bram.child.length-1; ++i ) {
        //console.log(st);
        st += addColumns( bram.child[i] );
        st += makeColumnHeader( bram );
      }
      st += addColumns( bram.child[bram.child.length-1] );
      if ( bram.parent != null ) {
        st += makeColumnHeader(")");
      }
      //console.log(st);
      return st;
    }
    else if ( bram.op == "~" ) {
      st += makeColumnHeader( bram );
      st += addColumns( bram.child[0] );
      return st;
    }
    else {
      return makeColumnHeader( bram );
    }
  }
  
  function makeColumnHeader ( b ) {
    context.clist.push(b);
    var st;
    //console.log(b);
    if ( b.hasOwnProperty("op") ) {
      if ( b.op == "" ) {
        st = b.st;
      }
      else {
        st = getOP(b.op);
      }
      if ( b.hasOwnProperty("selector") ) {
        b.selector.push(context.cindex);
      }
      else {
        b.selector = [context.cindex];
      }
    }
    else {
      st = b;
    }
    h = "<th id=\"h" + context.cindex++ + "\"";
    if ( b == "" ) {
      h += "style=\"width:2em;\"";
    }
    h += ">" + st + "</th>\n";

    return h;
  }

  function makeRow () {
    var st = "";
    for ( var i = 0; i < context.clist.length; ++i ) {
      if ( context.clist[i].hasOwnProperty("op") ) {
        // size=\"1\"
        st += "<td class=\"c" + i + "\"><input type=\"text\" maxlength=\"1\" style=\"width:1em;\"/><sub></sub></td>\n";
      }
      else {
        st += "<td class=\"c" + i + "\"/>\n";
      }
    }
    return st;
  }

  function shadeAtomic( b, st, color ) {
    if ( b.op == "" && b.st == st ) {
      for ( var i = 0; i < b.selector.length; ++i ) {
        $("#h"+b.selector[i]).css("background:"+color+";");
      }
    }
    else if ( b.op != "" ) {
      for ( var i = 0; i < b.child.length; ++i ) {
        shadeAtomic( b.child[i], st, color );
      }
    }
  }

  $("#adds").click( function () {
    
    var html = "<ul class=\"ins\"><input class=\"s\" type=\"text\" name=\"statement" ;
    html += (++context.stindex).toString();
    html += "\"></ul>";
    
    $("ul.ins:last").after( html );
    
  } );
  
  $("#dels").click( function () {
    
    if ( context.stindex > 0 ) {
      --context.stindex;
      $("ul.ins:last").remove();
    }
    
  } );
  
  $("#subs").click( function () {
    context.bramList.length = 0;
    var flag = true;
    $("input.s").each(function( i ) {
      var instring = $(this).val().replace(/ /g,'');
      var nbram = makeBram( instring, null );
      if ( nbram == ERR ) {
        printerr( i );
        flag = false;
      }
      else {
        context.bramList.push(nbram);
        //console.log(nbram);
      }
    } );
    
    if ( flag ) {
      $(".tt").html("<tr class=\"stlist\"></tr>\n<tr class=\"v0\"></tr>\n");

      context.cindex = 0;
      context.clist.length = 0;
      context.tfindex = 0;
      context.tflist.length = 0;

      st = ""
      for ( var i = 0; i < context.bramList.length; ++i ) {
        st += addColumns(context.bramList[i]);
        st += makeColumnHeader("");
      }
      $(".stlist").html(st);
      $(".v0").html(makeRow());
    }
    
    for ( var i = 0; i < context.cindex; ++i ) {
      next = context.clist[i];
      if ( next.hasOwnProperty("selector") ) {
        if ( next.op == "" ) {
          for ( var j = 0; j < next.selector.length; ++j ) {
            $(".c"+next.selector[j]).focus( next, function(e) {
              for ( var k = 0; k < context.bramList.length; ++k ) {
                shadeAtomic( context.bramList[k], e.data.st, "#efefef" );
              }
            } );
          }
        }
        for ( var j = 0; j < next.selector.length; ++j ) {
          $(".c"+next.selector[j]).focusout( next, function(e) {
            if ( $("input",this).val() == "T" || $("input",this).val() == "F" ) {
              //console.log($("sub", this));
              if ( $(this).find("sub").html() == "" ) {
                $(this).find("sub").html(++context.tfindex);
                context.tflist.push(e.data);
              }
            }
            else {
              var loc = $(this).find("sub").html();
              //console.log(loc);
              if ( loc != "" ) {
                $(this).find("sub").html("");
                //console.log(loc);
                for ( var k = loc; k < context.tflist.length; ++k ) {
                  //console.log(context.tflist);
                  context.tflist[k-1] = context.tflist[k];
                  sel = context.tflist[k];
                  //console.log(sel);
                  for ( var l = 0; l < sel.selector.length; ++l ) {
                    //console.log($(".c"+sel.selector[l]+" sub"));
                    $(".c"+sel.selector[l]+" sub").html(k);
                  }
                }
                --context.tflist.length;
                --context.tfindex;
              }
            }
          } );
        }
      }
    }

    $("#subs").val("Resubmit");
  } );
  
  $("#getc").click( function() {

    console.log($("#get-code").html());
    if ( $("#get-code").html() == "" ) {
      seen = [];

      strstff = JSON.stringify( context, function(key, val) {
        if (val != null && typeof val == "object") {
          if (seen.indexOf(val) >= 0) {
            return seen.indexOf(val);
          }
          seen.push(val);
          val.cid = seen.indexOf(val);
        }
        return val;
      });

      $("#get-code").html("<code>"+strstff+"</code>");
      $("#getc").val("Hide Table Data");
    }
    else {
      $("#get-code").html("");
      $("#getc").val("Get Table Data");
    }
    $("#get-code").toggle();

  } );

  $("#setc").click( function() {

    console.log($("#set-code").html());
    if ( $("#set-code").html() == "" ) {
      $("#set-code").html("<input type=\"textarea\"/><br/>")
      $("#set-code").after("<input id=\"loadc\" value=\"Load data\"/>")

      $("#loadc").click( function () {
        // actually need do this

      } );

    }
    $("show-code").toggle();

  } );
  
  console.log("page loaded");
  
} );