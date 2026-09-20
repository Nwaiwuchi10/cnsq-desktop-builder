const fs = require('fs');
const filePath = 'src/pages/chatForum/Channels/ChannelConverationView.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Mobile Thread Input */}')) {
    console.log('Found Mobile Thread Input at line ' + (i+1));
    let j = i;
    while (j < lines.length && !lines[j].includes('{/* Forwarding Modal */}')) {
      j++;
    }
    console.log('Found Forwarding Modal at line ' + (j+1));
    
    // We need to replace the closing tags of the mobile thread input
    // Looking backwards from j for the closing `)}`
    let k = j - 1;
    while (k >= i && !lines[k].includes(')}')) {
      k--;
    }
    console.log('Found closing )} at line ' + (k+1));
    // Replace from k-5 to k-1 (the </div> tags)
    // Wait, let's just rewrite the end of that block.
    // The lines are:
    //                   </button>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       )}
    
    let endContent = `                  </button>
                </div>
              </div>
            </div>
            ) : (
              <div className="p-3 pb-safe pb-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0 text-center text-sm text-gray-500">
                Only admins can send messages
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forwarding Modal */}`;
      
    // find the `<svg ...` then `</button>`
    let m = j - 1;
    while (!lines[m].includes('</button>')) { m--; }
    
    lines.splice(m, j - m + 1, endContent);
    break;
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Fixed syntax 5');
